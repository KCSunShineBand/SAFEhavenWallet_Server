const {
  Domain,
  MainProtocolSymbols,
  SubProtocolSymbols,
} = require('@airgap/coinlib-core');
const { Serializer, IACMessageType } = require('@airgap/serializer');
const {
  ethereum,
  ethereumProtocol,
  ethereumERC20Protocol,
} = require('./ethereum');
const {
  bitcoin,
  bitcoinProtocol,
  bitcoinSegwitProtocol,
  bitcoinTestnetProtocol,
} = require('./bitcoin');

const protocols = [];
protocols[MainProtocolSymbols.ETH] = ethereumProtocol;
protocols[MainProtocolSymbols.BTC] = bitcoinProtocol;
protocols[MainProtocolSymbols.BTC_SEGWIT] = bitcoinSegwitProtocol;

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
  switch (protocolSymbol) {
    case SubProtocolSymbols.ETH_ERC20:
      break;
    default:
      return protocols[protocolSymbol];
  }
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

const prepareTransaction = async (protocolSymbol, txOptions) => {
  const protocol = await getProtocol(protocolSymbol);
  const { publicKey, recipient, amount, speed = 'medium' } = txOptions;
  return await protocol.prepareTransaction(publicKey, recipient, amount, speed);
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
  prepareTransaction,
  broadcastTransaction,
  getTransactionStatus,
};
