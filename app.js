const express = require('express');
const { IACMessageType } = require('@airgap/serializer');
const {
  serialize,
  deserialize,
  getProtocol,
  getAddressFromPublicKey,
  prepareTransaction,
  broadcastTransaction,
  getTransactionStatus,
} = require('./protocols');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is working.');
});

app.post('/sync', async (req, res, next) => {
  const { qrData } = req.body;
  const output = await deserialize(qrData);
  const { protocol } = output;
  if (!protocol)
    return res.status(400).json({
      success: false,
      error: {
        errorMessage: 'Not supported protocol',
      },
    });
  try {
    const address = await getAddressFromPublicKey(
      protocol,
      output.payload.publicKey
    );
    res.status(200).json({
      success: true,
      ...output,
      address,
    });
  } catch (error) {
    console.log('error :>> ', error);
    console.log(JSON.stringify(error));
    res.status(400).json({ success: false, error: error });
  }
});

app.post('/transfer/request', async (req, res, next) => {
  try {
    const { protocol, ...txOptions } = req.body;
    const { publicKey } = txOptions;
    const unsignedTx = await prepareTransaction(protocol, txOptions);
    console.log('unsignedTx :>> ', unsignedTx);
    const data = await serialize([
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
    res.json({ success: true, qrData: data.join(',') });
  } catch (error) {
    console.log('error :>> ', error);
    console.log(JSON.stringify(error));
    res.status(400).json({ success: false, error: error });
  }
});

app.post('/transfer/response', async (req, res, next) => {
  const { protocol, qrData } = req.body;
  const output = await deserialize(qrData);
  const txHash = await broadcastTransaction(
    protocol,
    output.payload.transaction
  );
  res.status(200).json({ success: true, txHash });
});

app.post('/tx/status', async (req, res) => {
  const { protocol, txHash } = req.body;
  try {
    const status = await getTransactionStatus(protocol, txHash);
    res.status(200).json({ success: true, status });
  } catch (error) {
    res.status(404).json({ success: false, error });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
