# Contract Bundles

## Assumptions
- The bundle will be served from a location as a tar.gz, encoded as base64 for HTTP transport
- When decoded and uncompressed, the bundle will resolve to the following files:
  -- executable: a Plutus executable binary or Solidity smart contract compliant ABI
  -- meta.json: Meta information regarding the contract
  -- graphQlSchema.js: Assuming this is created during bundling (including typeDefs, and js resolvers)
  -- methods.js (optional; required for WASM execution): The JS file that exposes WASM execution methods
