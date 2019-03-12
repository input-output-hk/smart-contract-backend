/*
  Assumptions regarding Smart Contract Bundle
    - The bundle will be served from a location as a tar.gz,
    encoded as base64 for HTTP transport
    - When decoded and uncompressed, the bundle will resolve to
    the following files:
      -- executable: a Plutus executable binary or Solidity smart contract compliant ABI 
      -- meta.json: Meta information regarding the contract
      -- graphQlSchema.js: Assuming this is created during bundling (including typeDefs, and js resolvers)
      -- methods.js (optional; required for WASM execution): The JS file that exposes WASM execution methods 
*/

import axios from 'axios'

export interface ContractMeta {
  engine: 'solidity' | 'plutus'
  executableType: 'x86' | 'wasm' | 'abi'
  hash: string
}


export async function fetchBundle(contractAddress: string, location: string): Promise<{ graphQlSchema: any }> {
  const bundleResponse = await axios.get(location)
    .catch(() => { throw new Error(`Bundle not available at ${location}`) })

  // TODO: This can likely be made more efficient by doing this whole
  // process in memory. This approach is likely okay for MVP
  // Then decode, write to fs and uncompress
  // Get reference to graphQlSchema object
  // Cleanup fs
  // Return the graphQlSchema object

  return { graphQlSchema: {} }
}

export async function loadBundle(contractAddress: string, location: string) {
  const { graphQlSchema } = await fetchBundle(contractAddress, location)

}