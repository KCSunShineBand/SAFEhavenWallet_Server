const { NetworkType } = require('@airgap/coinlib-core/utils/ProtocolNetwork');

const bitcoin = require('@airgap/bitcoin/v0');

const bitcoinProtocol = new bitcoin.BitcoinProtocol();
const bitcoinSegwitProtocol = new bitcoin.BitcoinSegwitProtocol();
const bitcoinTestnetProtocol = new bitcoin.BitcoinTestnetProtocol();

module.exports = {
  bitcoin,
  bitcoinProtocol,
  bitcoinSegwitProtocol,
  bitcoinTestnetProtocol,
};
