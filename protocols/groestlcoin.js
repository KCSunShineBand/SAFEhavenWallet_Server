const groestlcoin = require('@airgap/groestlcoin/v0');
const { parseUnits } = require('viem');

const groestlcoinProtocol = new groestlcoin.GroestlcoinProtocol();
groestlcoinProtocol.prepareTransaction = async function () {
  const fee = await groestlcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await groestlcoinProtocol.getDecimals()).toString()]
  );
  unsignedTx = await groestlcoinProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await groestlcoinProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await groestlcoinProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  groestlcoin,
  groestlcoinProtocol,
};
