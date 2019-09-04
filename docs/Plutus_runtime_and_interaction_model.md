# A _Plutus_ runtime and interaction model
[_Plutus_](https://github.com/input-output-hk/plutus) presents a new paradigm for Smart Contracts by moving some of the execution out of the ledger. This changes how we think about implementing Smart Contracts as they can now be considered an application service, taking user input, and generating transactions which contain the lifted _Plutus_ core blocks. Read more about the [extended UTXO model](https://github.com/input-output-hk/plutus/tree/master/docs/extended-utxo)

## What are the requirements to run a _**Plutus**_ contract?
### Loading
1. The contract must be loaded from the file system.
2. Dynamic [bundle](./contract_bundle.md) generation.
3. It needs to be made available to the consumer to call it's endpoints
### Interaction
1. Transactions generated must be sent to the client for signing and submission
2. Any off-chain state persisted
3. Any triggers defined by the contract must be setup and managed with assurance they will fire

