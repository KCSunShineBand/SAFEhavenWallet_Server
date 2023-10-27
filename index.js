const express = require('express');
const { parseUnits, parseEther, formatEther, formatUnits } = require('viem');

const {
  Domain,
  MainProtocolSymbols,
  SubProtocolSymbols,
} = require('@airgap/coinlib-core');
const { Serializer, IACMessageType } = require('@airgap/serializer');
const { ethereum, ethereumProtocol } = require('./ethereum');
const {
  bitcoin,
  bitcoinProtocol,
  bitcoinSegwitProtocol,
  bitcoinTestnetProtocol,
} = require('./bitcoin');

const serializer = Serializer.getInstance();

const app = express();
const port = 3000;

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
  let protocol;
  switch (output.protocol) {
    case MainProtocolSymbols.ETH:
      protocol = ethereumProtocol;
      break;
    case MainProtocolSymbols.BTC:
      protocol = bitcoinProtocol;
      break;
    case MainProtocolSymbols.BTC_SEGWIT:
      protocol = bitcoinSegwitProtocol;
      break;
    default:
      return res.status(500).json({
        success: false,
        error: {
          errorMessage: 'Not supported protocol',
        },
      });
  }
  const addresses = await protocol.getAddressFromExtendedPublicKey(
    output.payload.publicKey,
    0,
    0,
    0
  );
  const address = addresses.address;
  res.status(200).json({
    success: true,
    ...output,
    address,
  });
});

app.post('/transfer/request', async (req, res, next) => {
  try {
    const {
      address,
      protocol,
      publicKey,
      recipient,
      amount,
      speed = 'medium',
    } = req.body;
    let unsignedTx;
    switch (protocol) {
      case MainProtocolSymbols.ETH:
        {
          const fee =
            await ethereumProtocol.estimateFeeDefaultsFromExtendedPublicKey(
              publicKey,
              [recipient],
              [parseEther(amount).toString()]
            );
          unsignedTx =
            await ethereumProtocol.prepareTransactionFromExtendedPublicKey(
              publicKey,
              0,
              [recipient],
              [parseEther(amount).toString()],
              parseEther(fee[speed]).toString()
            );
        }
        break;
      case MainProtocolSymbols.BTC:
        {
          const fee =
            await bitcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
              publicKey,
              [recipient],
              [parseUnits(amount, 8).toString()]
            );
          unsignedTx =
            await bitcoinProtocol.prepareTransactionFromExtendedPublicKey(
              publicKey,
              0,
              [recipient],
              [parseUnits(amount, 8).toString()],
              parseUnits(fee[speed], 8).toString()
            );
        }
        break;
      case MainProtocolSymbols.BTC_SEGWIT:
        {
          const fee =
            await bitcoinProtocol.estimateFeeDefaultsFromExtendedPublicKey(
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
        }
        break;
      default:
        break;
    }
    console.log('unsignedTx :>> ', unsignedTx);
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
    console.log(await serializer.deserialize(data));
    res.json({ success: true, qrData: data.join(',') });
  } catch (error) {
    console.log('error :>> ', error);
    console.log(JSON.stringify(error));
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
  const txHash = await ethereumProtocol.broadcastTransaction(
    output.payload.transaction
  );
  res.status(200).json({ success: true, txHash });
});

app.post('/tx/status', async (req, res) => {
  const { protocol, txHash } = req.body;
  try {
    let status;
    switch (protocol) {
      case MainProtocolSymbols.ETH:
        status = (await ethereumProtocol.getTransactionStatuses([txHash]))[0];
        console.log('status :>> ', status);
        break;
      default:
        break;
    }
    res.status(200).json({ success: true, status });
  } catch (error) {
    res.status(404).json({ success: false, error });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
