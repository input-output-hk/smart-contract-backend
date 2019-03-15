import axios from 'axios'
import { checkFolderExists, createDirectory, writeFile, removeDirectoryWithContents } from '../fs'
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

export async function unloadBundle (contractAddress: string): Promise<{}> {
  const { bundleDir, exists } = await getBundleInfo(contractAddress)
  if (!exists) return
  return removeDirectoryWithContents(bundleDir)
}
