const { NetworkType } = require('@airgap/coinlib-core/utils/ProtocolNetwork');
const { SubProtocolSymbols } = require('@airgap/coinlib-core');
const ethereum = require('@airgap/ethereum/v0');
const { parseUnits, createPublicClient, http } = require('viem');
const { mainnet, goerli } = require('viem/chains');
const erc20ABI = require('../abis/uniswapV2Pair.abi.json');

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(
    'https://eth-goerli.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA'
  ),
});

const ethereumProtocol = new ethereum.EthereumProtocol();
ethereumProtocol.prepareTransaction = async function (
  publicKey,
  recipient,
  amount,
  speed
) {
  const fee = await ethereumProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await ethereumProtocol.getDecimals()).toString()]
  );
  unsignedTx = await ethereumProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await ethereumProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await ethereumProtocol.getFeeDecimals()).toString()
  );
  console.log('unsignedTx :>> ', unsignedTx);
  return unsignedTx;
};

const ethereumGoerliProtocol = new ethereum.EthereumProtocol(
  new ethereum.EthereumProtocolOptions(
    new ethereum.EthereumProtocolNetwork(
      'Goerli',
      NetworkType.TESTNET,
      'https://eth-goerli.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA',
      'https://goerli.etherscan.io',
      new ethereum.EthereumProtocolNetworkExtras(
        5,
        'https://goerli.etherscan.io/api'
      )
    )
  )
);
ethereumGoerliProtocol.prepareTransaction = async function (
  publicKey,
  recipient,
  amount,
  speed
) {
  const fee =
    await ethereumGoerliProtocol.estimateFeeDefaultsFromExtendedPublicKey(
      publicKey,
      [recipient],
      [
        parseUnits(
          amount,
          await ethereumGoerliProtocol.getDecimals()
        ).toString(),
      ]
    );
  unsignedTx =
    await ethereumGoerliProtocol.prepareTransactionFromExtendedPublicKey(
      publicKey,
      0,
      [recipient],
      [
        parseUnits(
          amount,
          await ethereumGoerliProtocol.getDecimals()
        ).toString(),
      ],
      parseUnits(
        fee[speed],
        await ethereumGoerliProtocol.getFeeDecimals()
      ).toString()
    );
  return unsignedTx;
};

const getERC20Protocol = async (contractAddress) => {
  const metadata = await publicClient.multicall({
    contracts: [
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'name',
      },
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'symbol',
      },
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'decimals',
      },
    ],
  });
  const name = metadata[0].result;
  const symbol = metadata[1].result;
  const decimals = metadata[2].result;
  const erc20Protocol = new ethereum.GenericERC20(
    new ethereum.EthereumERC20ProtocolOptions(
      new ethereum.EthereumProtocolNetwork(),
      new ethereum.EthereumERC20ProtocolConfig(
        name,
        symbol,
        symbol,
        SubProtocolSymbols.ETH_ERC20,
        contractAddress,
        decimals
      )
    )
  );
  erc20Protocol.prepareTransaction = async function (
    publicKey,
    recipient,
    amount,
    speed
  ) {
    const fee = await erc20Protocol.estimateFeeDefaultsFromExtendedPublicKey(
      publicKey,
      [recipient],
      [parseUnits(amount, await erc20Protocol.getDecimals()).toString()]
    );
    unsignedTx = await erc20Protocol.prepareTransactionFromExtendedPublicKey(
      publicKey,
      0,
      [recipient],
      [parseUnits(amount, await erc20Protocol.getDecimals()).toString()],
      parseUnits(fee[speed], await erc20Protocol.getFeeDecimals()).toString()
    );
    return unsignedTx;
  };
  return erc20Protocol;
};

const getGoerliERC20Protocol = async (contractAddress) => {
  const metadata = await publicClient.multicall({
    contracts: [
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'name',
      },
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'symbol',
      },
      {
        address: contractAddress,
        abi: erc20ABI,
        functionName: 'decimals',
      },
    ],
  });
  const name = metadata[0].result;
  const symbol = metadata[1].result;
  const decimals = metadata[2].result;
  const goerliERC20Protocol = new ethereum.GenericERC20(
    new ethereum.EthereumERC20ProtocolOptions(
      new ethereum.EthereumProtocolNetwork(
        'Goerli',
        NetworkType.TESTNET,
        'https://eth-goerli.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA',
        'https://goerli.etherscan.io',
        new ethereum.EthereumProtocolNetworkExtras(
          5,
          'https://goerli.etherscan.io/api'
        )
      ),
      new ethereum.EthereumERC20ProtocolConfig(
        name,
        symbol,
        symbol,
        SubProtocolSymbols.ETH_ERC20,
        contractAddress,
        decimals
      )
    )
  );
  goerliERC20Protocol.prepareTransaction = async function (
    publicKey,
    recipient,
    amount,
    speed
  ) {
    const pubKey = await goerliERC20Protocol.getPublicKeyFromExtendedPublicKey(
      publicKey,
      0,
      0
    );
    const fee = await goerliERC20Protocol.estimateFeeDefaultsFromPublicKey(
      pubKey,
      [recipient],
      [parseUnits(amount, await goerliERC20Protocol.getDecimals()).toString()]
    );
    console.log('fee :>> ', fee);
    unsignedTx = await goerliERC20Protocol.prepareTransactionFromPublicKey(
      pubKey,
      [recipient],
      [parseUnits(amount, await goerliERC20Protocol.getDecimals()).toString()],
      parseUnits(
        fee[speed],
        await goerliERC20Protocol.getFeeDecimals()
      ).toString()
    );
    return unsignedTx;
  };
  return goerliERC20Protocol;
};

module.exports = {
  ethereum,
  ethereumProtocol,
  ethereumGoerliProtocol,
  getERC20Protocol,
  getGoerliERC20Protocol,
  publicClient,
};
