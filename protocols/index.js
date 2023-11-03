const {
  Domain,
  MainProtocolSymbols,
  SubProtocolSymbols,
} = require('@airgap/coinlib-core');
const { Serializer, IACMessageType } = require('@airgap/serializer');
const {
  createPublicClient,
  parseUnits,
  encodeFunctionData,
  parseEther,
} = require('viem');
const { mainnet, goerli } = require('viem/chains');
const {
  UniswapPair,
  UniswapPairSettings,
  ChainId,
  UniswapVersion,
  ETH,
} = require('simple-uniswap-sdk');

const { aeternityProtocol } = require('./aeternity');
const { bitcoinProtocol, bitcoinSegwitProtocol } = require('./bitcoin');
const {
  ethereumProtocol,
  ethereumGoerliProtocol,
  getERC20Protocol,
  getGoerliERC20Protocol,
  publicClient,
} = require('./ethereum');
const { groestlcoinProtocol } = require('./groestlcoin');
const { tezosProtocol, tezosShieldedTezProtocol } = require('./tezos');
const { cosmosProtocol } = require('./cosmos');
const { polkadotProtocol, kusamaProtocol } = require('./polkadot');
const {
  moonbeamProtocol,
  moonbaseProtocol,
  moonriverProtocol,
} = require('./moonbeam');
const { astarProtocol, shidenProtocol } = require('./astar');

const erc20ABI = require('../abis/uniswapV2Pair.abi.json');
const uniswapV2PairABI = require('../abis/uniswapV2Pair.abi.json');
const multicall3ABI = require('../abis/multicall3.abi.json');

const protocols = [];
protocols[MainProtocolSymbols.AE] = aeternityProtocol;
protocols[MainProtocolSymbols.BTC] = bitcoinProtocol;
protocols[MainProtocolSymbols.BTC_SEGWIT] = bitcoinSegwitProtocol;
// protocols[MainProtocolSymbols.ETH] = ethereumProtocol;
protocols[MainProtocolSymbols.ETH] = ethereumGoerliProtocol;
protocols[MainProtocolSymbols.XTZ] = tezosProtocol;
protocols[MainProtocolSymbols.XTZ_SHIELDED] = tezosShieldedTezProtocol;
protocols[MainProtocolSymbols.GRS] = groestlcoinProtocol;
protocols[MainProtocolSymbols.COSMOS] = cosmosProtocol;
protocols[MainProtocolSymbols.POLKADOT] = polkadotProtocol;
protocols[MainProtocolSymbols.KUSAMA] = kusamaProtocol;
protocols[MainProtocolSymbols.MOONBASE] = moonbaseProtocol;
protocols[MainProtocolSymbols.MOONRIVER] = moonriverProtocol;
protocols[MainProtocolSymbols.MOONBEAM] = moonbeamProtocol;
protocols[MainProtocolSymbols.ASTAR] = astarProtocol;
protocols[MainProtocolSymbols.SHIDEN] = shidenProtocol;

const serializer = Serializer.getInstance();

const serialize = async (data) => {
  return await serializer.serialize(data);
};

const deserialize = async (qrData) => {
  const data = (() => {
    try {
      const url = new URL(qrData);
      return [url.searchParams.get('d')];
    } catch (e) {
      return qrData.split(',');
    }
  })();
  return (await serializer.deserialize(data))[0];
};

const getProtocol = async (protocolSymbol, contractAddress) => {
  let protocol;
  switch (protocolSymbol) {
    case SubProtocolSymbols.ETH_ERC20:
      // protocol = await getERC20Protocol(contractAddress);
      protocol = await getGoerliERC20Protocol(contractAddress);
      break;
    default:
      protocol = protocols[protocolSymbol];
      break;
  }
  if (!protocol) {
    throw new Error('Protocol not supported.');
  } else return protocol;
};

const getAddressFromPublicKey = async (protocolSymbol, publicKey) => {
  const protocol = await getProtocol(protocolSymbol);
  const addresses = await protocol.getAddressFromExtendedPublicKey(
    publicKey,
    0,
    0,
    0
  );
  return addresses.address;
};

const prepareTransfer = async (protocolSymbol, txOptions) => {
  const {
    publicKey,
    recipient,
    amount,
    speed = 'medium',
    contract,
  } = txOptions;
  const protocol = await getProtocol(protocolSymbol, contract);
  return await protocol.prepareTransaction(publicKey, recipient, amount, speed);
};

const prepareSwap = async (protocolSymbol, txOptions) => {
  const {
    publicKey,
    recipient,
    amount,
    speed = 'medium',
    token0Contract,
    token1Contract,
  } = txOptions;
  const address = await getAddressFromPublicKey('eth', publicKey);
  const ETH_CA = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  const uniswapPair = new UniswapPair({
    fromTokenContractAddress:
      token0Contract == ETH_CA ? ETH.GORLI().contractAddress : token0Contract,
    toTokenContractAddress:
      token1Contract == ETH_CA ? ETH.GORLI().contractAddress : token1Contract,
    ethereumAddress: address,
    chainId: ChainId.GÖRLI,
    settings: new UniswapPairSettings({
      slippage: 0.0005,
      deadlineMinutes: 20,
      disableMultihops: false,
      uniswapVersions: [UniswapVersion.v2],
    }),
  });

  const uniswapPairFactory = await uniswapPair.createFactory();
  const trade = await uniswapPairFactory.trade(amount);
  if (!trade.fromBalance.hasEnough) {
    throw new Error('Not enough balance to swap');
  }

  const calls = [
    [
      [
        trade.transaction.to,
        false,
        trade.transaction.value,
        trade.transaction.data,
      ],
    ],
  ];
  if (trade.approvalTransaction) {
    calls[0].unshift([
      trade.approvalTransaction.to,
      false,
      trade.approvalTransaction.value,
      trade.approvalTransaction.data,
    ]);
  }
  console.log('calls :>> ', calls);
  const calldata = encodeFunctionData({
    abi: multicall3ABI,
    functionName: 'aggregate3Value',
    args: calls,
  });
  const tx = await publicClient.prepareTransactionRequest({
    account: address,
    address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    abi: multicall3ABI,
    functionName: 'aggregate3Value',
    args: calls,
    value: trade.approvalTransaction
      ? BigInt(trade.approvalTransaction.value) +
        BigInt(trade.transaction.value)
      : BigInt(trade.transaction.value),
  });
  const gasPrice = await publicClient.getGasPrice();
  let gasPrices = [];
  gasPrices['low'] = gasPrice / 2n;
  gasPrices['medium'] = gasPrice;
  gasPrices['high'] = gasPrice + gasPrice / 2n;
  const unsignedTx = {
    nonce: `0x${tx.nonce.toString(16)}`,
    gasLimit: `0x${(tx.gas * 5n).toString(16)}`,
    gasPrice: `0x${gasPrices[speed].toString(16)}`,
    to: tx.address,
    value: `0x${tx.value.toString(16)}`,
    chainId: publicClient.chain.id,
    data: calldata,
  };
  return unsignedTx;
};

const broadcastTransaction = async (protocolSymbol, transaction) => {
  const protocol = await getProtocol(protocolSymbol);
  return await protocol.broadcastTransaction(transaction);
};

const getTransactionStatus = async (protocolSymbol, txHash) => {
  const protocol = await getProtocol(protocolSymbol);
  return (await protocol.getTransactionStatuses([txHash]))[0];
};

module.exports = {
  serialize,
  deserialize,
  getProtocol,
  getAddressFromPublicKey,
  prepareTransfer,
  prepareSwap,
  broadcastTransaction,
  getTransactionStatus,
};
