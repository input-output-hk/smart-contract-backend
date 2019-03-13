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
import { checkFolderExists, createDirectory, writeFile } from './fs'
const decompress = require('decompress')

export interface ContractMeta {
  engine: 'solidity' | 'plutus'
  executableType: 'x86' | 'wasm' | 'abi'
  hash: string
}

export async function fetchAndWriteBundle ({ bundlePath, bundleDir, location }: { bundlePath: string, bundleDir: string, location: string }): Promise<void> {
  const bundleResponse = await axios.get(location)
    .catch(() => { throw new Error(`Bundle not available at ${location}`) })

  await createDirectory(bundleDir)
  const bundle = Buffer.from(bundleResponse.data.bundle, 'base64')

  await writeFile(bundlePath, bundle)
  await decompress(bundlePath, bundleDir)
}

export async function getBundleInfo (contractAddress: string): Promise<{ bundlePath: string, bundleDir: string, exists: boolean }> {
  const bundleDir = `${__dirname}/${contractAddress}`
  const bundlePath = `${bundleDir}/${contractAddress}.tar.gz`
  const bundleExists = await checkFolderExists(bundleDir)
  return { bundlePath, bundleDir, exists: bundleExists }
}

export async function loadBundle (contractAddress: string, location: string): Promise<{ graphQlSchema: any, engine: 'solidity' | 'plutus' }> {
  const { bundlePath, bundleDir, exists } = await getBundleInfo(contractAddress)
  if (!exists) {
    await fetchAndWriteBundle({
      bundleDir,
      bundlePath,
      location
    })
  }

  const graphQlSchema = require(`${bundleDir}/graphQlSchema.js`)
  const contractMeta: ContractMeta = require(`${bundleDir}/meta.json`)
  return { graphQlSchema, engine: contractMeta.engine }
}
