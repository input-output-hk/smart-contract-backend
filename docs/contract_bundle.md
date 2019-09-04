# Contract Bundle
The bundle contains the compiled executable and JavaScript executable [endpoints](../src/lib/createEndpoint.ts). This bundle is dynamically generated when a contract is loaded, as Plutus contracts are self-descriptive with their `schema` endpoint. When a usecase arises, the bundle generation can be lifted to an external module to use outside of the Smart Contract Backend. 

View the TypeScript [model](../src/core/Bundle.ts) for reference. 