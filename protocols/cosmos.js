const cosmos = require('@airgap/cosmos/v0');
const { parseUnits } = require('viem');

const cosmosProtocol = new cosmos.CosmosProtocol();
cosmosProtocol.prepareTransaction = async function () {
  const fee = await cosmosProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await cosmosProtocol.getDecimals()).toString()]
  );
  unsignedTx = await cosmosProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await cosmosProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await cosmosProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  cosmos,
  cosmosProtocol,
};
