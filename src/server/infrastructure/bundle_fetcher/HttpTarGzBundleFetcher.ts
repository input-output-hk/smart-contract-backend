import { BundleFetcher } from '../../application'
import { NetworkInterface } from '../../application/lib/NetworkInterface'
import { BundleNotFound } from '../../core/errors'
import { Bundle } from '../../core'
const decompress = require('decompress')

export function HttpTarGzBundleFetcher (networkInterface: NetworkInterface): BundleFetcher {
  return {
    async fetch (uri: string): Promise<Bundle> {
      const response = await networkInterface.get(uri)
        .catch((error) => {
          if (error.code !== 'ENOTFOUND') throw error
          throw new BundleNotFound(uri)
        })
      const [ meta, graphQlSchema, executable ] = await decompress(Buffer.from(response.data, 'base64'))
      return {
        executable: executable.data.toString(),
        graphQlSchema: graphQlSchema.data.toString(),
        meta: JSON.parse(meta.data.toString())
      }
    }
  }
}
