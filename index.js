const express = require('express');
const {
  createPublicClient,
  http,
  parseUnits,
  parseEther,
  formatEther,
  formatUnits,
} = require('viem');
const { mainnet, sepolia } = require('viem/chains');
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://eth-sepolia.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA'
  ),
});
const ethereum = require('@airgap/ethereum/v0');
const {
  Domain,
  MainProtocolSymbols,
  SubProtocolSymbols,
} = require('@airgap/coinlib-core');
const { NetworkType } = require('@airgap/coinlib-core/utils/ProtocolNetwork');
const { Serializer, IACMessageType } = require('@airgap/serializer');

const serializer = Serializer.getInstance();

const app = express();
const port = 3000;
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

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/sync', async (req, res, next) => {
  const { qrData } = req.body;
  const data = (() => {
    try {
      const url = new URL(qrData);
      return [url.searchParams.get('d')];
    } catch (e) {
      return qrData.split(',');
    }
  })();
  const output = (await serializer.deserialize(data))[0];
  console.log('output :>> ', output);
  const addresses = await ethereumProtocol.getAddressFromExtendedPublicKey(
    output.payload.publicKey,
    0,
    0,
    0
  );
  console.log('address :>> ', addresses);
  res.status(200).json({
    ...output,
    address: addresses.address,
  });
});

app.post('/transfer/request', async (req, res, next) => {
  try {
    const { address, protocol, publicKey, recipient, amount } = req.body;
    let unsignedTx;
    switch (protocol) {
      case 'eth':
        {
          console.log('address :>> ', address);
          const gas = await publicClient.estimateGas({
            account: address,
            to: recipient,
            value: parseEther(amount),
          });
          const gasPrice = await publicClient.getGasPrice();
          console.log('gasPrice :>> ', gasPrice);
          unsignedTx =
            await ethereumProtocol.prepareTransactionFromExtendedPublicKey(
              publicKey,
              0,
              [recipient],
              [parseEther(amount).toString()],
              (gas * gasPrice * 5n).toString()
            );
        }
        break;
      default:
        break;
    }
    const data = await serializer.serialize([
      {
        id: (Math.random() * 10000000000).toFixed(0).padStart(10, 0),
        type: IACMessageType.TransactionSignRequest,
        protocol: protocol,
        payload: {
          transaction: unsignedTx,
          publicKey: publicKey,
          callbackURL: 'airgap-wallet://?d=',
        },
      },
    ]);
    console.log('data :>> ', data);
    console.log(await serializer.deserialize(data));
    res.json({ qrData: data.join(',') });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});

app.post('/transfer/response', async (req, res, next) => {
  const { qrData } = req.body;
  const data = (() => {
    try {
      const url = new URL(qrData);
      return [url.searchParams.get('d')];
    } catch (e) {
      return qrData.split(',');
    }
  })();
  const output = (await serializer.deserialize(data))[0];
  const tx = '0x' + output.payload.transaction;
  console.log('tx :>> ', tx);
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: tx,
  });
  res.status(200).json({ txHash });
});

app.post('/tx/status', async (req, res) => {
  const { txHash } = req.body;
  try {
    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txHash,
    });
    console.log('txReceipt :>> ', txReceipt);
    res.status(200).json({ success: true, status: txReceipt.status });
  } catch (error) {
    res.status(404).json({ success: false, error });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
