# My SafeHaven Wallet Backend API

## Supported Protocols

- Aeternity
- Astar
- Bitcoin
- Bitcoin Segwit
- Cosmos
- Ethereum
- Groestlcoin
- Moonbeam
- Polkadot
- Tezos

## Unsupported Chains (v1)

- Coreum
- Internet Computer Protocol (ICP)
- Mina
- Optimism

## API endpoints

### POST /sync

Read QR code (v2) from Airgap Vault and send the data to this endpoint for retrieving address and publicKey.

- request

```json
{
  "qrData": "PVttrMLstECaVRyXomLLSSJX8LxrjeDqn5sdXURLyT8emyGVfFKyCyYAe8w431gq3hhRpdmwP4ZB34e27GJBB5FZdMnNxU5PERdJ52KNrNKdfVfG3noULR83nw7Ca9xJMQunGUca5Q4VEvvT1KWcA3pcbDQz1CbnVzubGPpGwH7pRNsCkzrnXLL1wR54joJWXjpieyhUQcTD7KBQHm9tC5U7"
}
```

- response

```json
{
  "type": 4,
  "protocol": "eth",
  "id": "1508957215",
  "payload": {
    "derivationPath": "m/44'/60'/0'",
    "isExtendedPublicKey": true,
    "publicKey": "xpub6DF5kbC31TTqdiE2SapHccsYdyp3dbwVVWoGx8EGeXeG3QZWvqAYYFVyjS81oPFsxSPosVpRuZ6RLsD8ALL7jm7fjJkbkzLK37j23o31Ji3"
  },
  "address": "0xa99A97B95f7D43aEe1AD0Cbc82f317bFEcBDa043"
}
```

### POST /transfer/request

Send below data to transfer ETH to other address. You can use return data to generate QR code and read it from Airgap Vault.

- request

```json
{
  "protocol": "eth",
  "address": "0xa99A97B95f7D43aEe1AD0Cbc82f317bFEcBDa043",
  "publicKey": "xpub6DF5kbC31TTqdiE2SapHccsYdyp3dbwVVWoGx8EGeXeG3QZWvqAYYFVyjS81oPFsxSPosVpRuZ6RLsD8ALL7jm7fjJkbkzLK37j23o31Ji3",
  "recipient": "0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e",
  "amount": "0.1"
}
```

- response

```json
{
  "qrData": "some string"
}
```

### POST /transfer/response

Sign the requested transaction, and generate QR code(v2) for syncing. Read it from wallet and send it to this endpoint to broadcast it.

- request

```json
{
  "qrData": "3NAsE4b5AKXTMMYzfqPygB6GPo3owdKM1J4wG6TPnXvUkiegejn4UTK9Hmi5BZJTmY4vDo43mjfGKA16aiQ3C1s6AuY36YqFsd8CRiBxwF5Sf3bNTzFHcobh4V7UqpgUikEzcsHFuznJVtbnRxLJExY8TRYB1gkC3KASHy9AqFKoMKqG286qwVX8fDCSsua1dYdxUDgjqPKr2ZZeJHaDGJUAB4EypinBYAvfgUGYSKHJarX7NjiFPzzqsrfXXZ5p7hRLcV9o1Y7d3GwoY2nweuyeviiYzJ7PGhE2tHViUE3hhxdviGAUiM7VCzmv8xuQDDKLy6AZUwwbp7gE3ZxrDmhDyXFjHGUZXfYNeG3saUzJViGK3JJD9i2tRGJzcEVTuJCaTpSqL4JdGtN3rhacw6T78vgsQnfaR8oMTSVV1wCB7cu2bZMvovdCQRXbCQnLrcezCueW2mF5ACVZyY5G1yN15bB2pQMPws8c6qpEhja9hWVCteUBNnjGZn8K517cT2TTa"
}
```

- response

```json
{
  "txHash": "0x4c1fcc13ef030e15fd1b8f0bf67ce44f45c1aaac7bfe66e3e956ab64e13f731f"
}
```

### POST /tx/status

Fetch status with transaction hash

- request

```json
{
  "protocol": "eth",
  "txHash": "0x4c1fcc13ef030e15fd1b8f0bf67ce44f45c1aaac7bfe66e3e956ab64e13f731f"
}
```

- response

```json
{
  "status": "success"
}
```

## Error handling

All error response include success = false and error object.

```json
{ "success": false, "error": {} }
```
