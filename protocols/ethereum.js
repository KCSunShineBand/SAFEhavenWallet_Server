const { NetworkType } = require('@airgap/coinlib-core/utils/ProtocolNetwork');
const ethereum = require('@airgap/ethereum/v0');
const { parseUnits, parseEther, formatEther, formatUnits } = require('viem');

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

const ethereumERC20Protocol = new ethereum.GenericERC20(
  new ethereum.EthereumERC20ProtocolOptions(
    new ethereum.EthereumProtocolNetwork(
      'Sepolia',
      NetworkType.TESTNET,
      'https://eth-sepolia.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA',
      'https://sepolia.etherscan.io',
      {
        blockExplorerApi: 'https://sepolia.etherscan.io/api',
        chainID: 11155111,
      }
    ),
    new ethereum.EthereumERC20ProtocolConfig()
  )
);

ethereumProtocol.prepareTransaction = async function (
  publicKey,
  recipient,
  amount,
  speed
) {
  const fee = await ethereumProtocol.estimateFeeDefaultsFromExtendedPublicKey(
    publicKey,
    [recipient],
    [parseEther(amount).toString()]
  );
  unsignedTx = await ethereumProtocol.prepareTransactionFromExtendedPublicKey(
    publicKey,
    0,
    [recipient],
    [parseEther(amount).toString()],
    parseEther(fee[speed]).toString()
  );
  return unsignedTx;
};

module.exports = { ethereum, ethereumProtocol, ethereumERC20Protocol };
