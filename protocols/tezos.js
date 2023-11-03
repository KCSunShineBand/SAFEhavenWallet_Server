const tezos = require('@airgap/tezos/v0');
const { parseUnits } = require('viem');

const tezosProtocol = new tezos.TezosProtocol();
tezosProtocol.prepareTransaction = async function () {
  const fee = await tezosProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await tezosProtocol.getDecimals()).toString()]
  );
  unsignedTx = await tezosProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await tezosProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await tezosProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const tezosShildedTezProtocol = new tezos.TezosShieldedTezProtocol();
tezosShildedTezProtocol.prepareTransaction = async function () {
  const fee =
    await tezosShildedTezProtocol.estimateFeeDefaultsFromExtendedPublicKey(
      publicKey,
      [recipient],
      [
        parseUnits(
          amount,
          await tezosShildedTezProtocol.getDecimals()
        ).toString(),
      ]
    );
  unsignedTx =
    await tezosShildedTezProtocol.prepareTransactionFromExtendedPublicKey(
      publicKey,
      0,
      [recipient],
      [
        parseUnits(
          amount,
          await tezosShildedTezProtocol.getDecimals()
        ).toString(),
      ],
      parseUnits(
        fee[speed],
        await tezosShildedTezProtocol.getFeeDecimals()
      ).toString()
    );
  return unsignedTx;
};

module.exports = {
  tezos,
  tezosProtocol,
  tezosShildedTezProtocol,
};
