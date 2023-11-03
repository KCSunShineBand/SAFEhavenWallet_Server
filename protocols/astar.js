const astar = require('@airgap/astar/v0');
const { parseUnits } = require('viem');

const astarProtocol = new astar.AstarProtocol();
astarProtocol.prepareTransaction = async function () {
  const fee = await astarProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await astarProtocol.getDecimals()).toString()]
  );
  unsignedTx = await astarProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await astarProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await astarProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const shidenProtocol = new astar.ShidenProtocol();
shidenProtocol.prepareTransaction = async function () {
  const fee = await shidenProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await shidenProtocol.getDecimals()).toString()]
  );
  unsignedTx = await shidenProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await shidenProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await shidenProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

module.exports = {
  astar,
  astarProtocol,
  shidenProtocol,
};
