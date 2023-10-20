const express = require('express');
const { createPublicClient, http, parseEther } = require('viem');
const { mainnet } = require('viem/chains');
const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(
        'https://eth-mainnet.g.alchemy.com/v2/4skKweefhtqDlhmh1W502pf8b3O9ymuA'
    ),
});
const { EthereumProtocol, SyncProtocolUtils, EncodedType } = require('airgap-coin-lib');

const erc20Abi = require('./erc20.abi.json');

const app = express();
const port = 3000;
const ethereumProtocol = new EthereumProtocol();
const syncProtocolUtils = new SyncProtocolUtils()

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/transfer', async (req, res, next) => {
    try {
        const { publicKey, recipient, amount } = req.body;
        const account = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
        const rawEthereumTx = await ethereumProtocol.prepareTransactionFromPublicKey(
            publicKey,
            [recipient],
            [parseEther(amount)]
        );
        const syncString = await syncProtocolUtils.serialize({
            version: SERIALIZER_VERSION,
            protocol: ethereum.identifier,
            type: EncodedType.UNSIGNED_TRANSACTION,
            payload: {
                publicKey: publicKey,
                callback: 'airgap-wallet://?d=',
                transaction: rawEthereumTx
            }
        })
        res.json({ syncString });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
