const aeternity = require('@airgap/aeternity/v0');
const { parseUnits } = require('viem');

const aeternityProtocol = new aeternity.AeternityProtocol();
aeternityProtocol.prepareTransaction = async function () {
  const fee = await aeternityProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await aeternityProtocol.getDecimals()).toString()]
  );
  unsignedTx = await aeternityProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await aeternityProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await aeternityProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  aeternity,
  aeternityProtocol,
};
