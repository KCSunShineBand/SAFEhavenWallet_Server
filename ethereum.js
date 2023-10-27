const { createPublicClient, http } = require('viem');
const { mainnet, sepolia } = require('viem/chains');
const { NetworkType } = require('@airgap/coinlib-core/utils/ProtocolNetwork');
const ethereum = require('@airgap/ethereum/v0');

const ethereumProtocol = new ethereum.EthereumProtocol(
  new ethereum.EthereumProtocolOptions(
    new ethereum.EthereumProtocolNetwork(
      'Sepolia',
      NetworkType.TESTNET,
      'https://eth-sepolia.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA',
      'https://sepolia.etherscan.io',
      {
        blockExplorerApi: 'https://sepolia.etherscan.io/api',
        chainID: 11155111,
      }
    )
  )
);

module.exports = { ethereum, ethereumProtocol };
