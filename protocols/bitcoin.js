const bitcoin = require('@airgap/bitcoin/v0');
const { parseUnits } = require('viem');

const bitcoinProtocol = new bitcoin.BitcoinProtocol();
bitcoinProtocol.prepareTransaction = async function () {
  const fee = await bitcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, await bitcoinProtocol.getDecimals()).toString()]
  );
  unsignedTx = await bitcoinProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, await bitcoinProtocol.getDecimals()).toString()],
    parseUnits(fee[speed], await bitcoinProtocol.getFeeDecimals()).toString()
  );
  return unsignedTx;
};

const bitcoinSegwitProtocol = new bitcoin.BitcoinSegwitProtocol();
bitcoinSegwitProtocol.prepareTransaction = async function () {
  const fee =
    await bitcoinSegwitProtocol.estimateFeeDefaultsFromExtendedPublicKey(
      publicKey,
      [recipient],
      [parseUnits(amount, await bitcoinSegwitProtocol.getDecimals()).toString()]
    );
  unsignedTx =
    await bitcoinSegwitProtocol.prepareTransactionFromExtendedPublicKey(
      publicKey,
      0,
      [recipient],
      [
        parseUnits(
          amount,
          await bitcoinSegwitProtocol.getDecimals()
        ).toString(),
      ],
      parseUnits(
        fee[speed],
        await bitcoinSegwitProtocol.getFeeDecimals()
      ).toString(),
      { masterFingerprint: '00000000', replaceByFee: false }
    );
  return unsignedTx;
};

module.exports = {
  bitcoin,
  bitcoinProtocol,
  bitcoinSegwitProtocol,
};
