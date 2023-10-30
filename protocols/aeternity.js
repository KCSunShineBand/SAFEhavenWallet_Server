const aeternity = require('@airgap/aeternity')
const { parseUnits, parseEther, formatEther, formatUnits } = require('viem');

const bitcoinProtocol = new bitcoin.BitcoinProtocol();
bitcoinProtocol.prepareTransaction = async function () {
  const fee = await bitcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, 8).toString()]
  );
  unsignedTx = await bitcoinProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseUnits(amount, 8).toString()],
    parseUnits(fee[speed], 8).toString()
  );
  return unsignedTx;
};

const bitcoinSegwitProtocol = new bitcoin.BitcoinSegwitProtocol();
bitcoinSegwitProtocol.prepareTransaction = async function () {
  const fee = await bitcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseUnits(amount, 8).toString()]
  );
  unsignedTx =
    await bitcoinSegwitProtocol.prepareTransactionFromExtendedPublicKey(
      publicKey,
      0,
      [recipient],
      [parseUnits(amount, 8).toString()],
      parseUnits(fee[speed], 8).toString(),
      { masterFingerprint: '00000000', replaceByFee: false }
    );
  return unsignedTx;
};

module.exports = {
  bitcoin,
  bitcoinProtocol,
  bitcoinSegwitProtocol,
};
