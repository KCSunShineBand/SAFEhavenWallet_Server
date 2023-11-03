const moonbeam = require('@airgap/moonbeam/v0');
const { parseUnits } = require('viem');

const moonbeamProtocol = new moonbeam.MoonbeamProtocol();
moonbeamProtocol.prepareTransaction = async function () {
  const fee = await moonbeamProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await moonbeamProtocol.getDecimals()).toString()]
  );
  unsignedTx = await moonbeamProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await moonbeamProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await moonbeamProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const moonbaseProtocol = new moonbeam.MoonbaseProtocol();
moonbaseProtocol.prepareTransaction = async function () {
  const fee = await moonbaseProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await moonbaseProtocol.getDecimals()).toString()]
  );
  unsignedTx = await moonbaseProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await moonbaseProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await moonbaseProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const moonriverProtocol = new moonbeam.MoonriverProtocol();
moonriverProtocol.prepareTransaction = async function () {
  const fee = await moonriverProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await moonriverProtocol.getDecimals()).toString()]
  );
  unsignedTx = await moonriverProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await moonriverProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await moonriverProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  moonbeam,
  moonbeamProtocol,
  moonbaseProtocol,
  moonriverProtocol,
};
