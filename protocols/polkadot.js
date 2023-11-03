const polkadot = require('@airgap/polkadot/v0');
const { parseUnits } = require('viem');

const polkadotProtocol = new polkadot.PolkadotProtocol();
polkadotProtocol.prepareTransaction = async function () {
  const fee = await polkadotProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await polkadotProtocol.getDecimals()).toString()]
  );
  unsignedTx = await polkadotProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await polkadotProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await polkadotProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const kusamaProtocol = new polkadot.KusamaProtocol();
kusamaProtocol.prepareTransaction = async function () {
  const fee = await kusamaProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await kusamaProtocol.getDecimals()).toString()]
  );
  unsignedTx = await kusamaProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await kusamaProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await kusamaProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  polkadot,
  polkadotProtocol,
  kusamaProtocol,
};
