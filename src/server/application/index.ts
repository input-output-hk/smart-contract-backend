import { buildApiServer } from './lib/static_server'
import { contractServers, availablePorts } from '../infrastructure/storage'
import { initializeProxy } from './lib/proxy'
import { Server } from 'http'
import { ApolloServer } from 'apollo-server-express'

export async function bootApi (apiPort: number): Promise<{ staticApi: ApolloServer, proxy: Server }> {
  contractServers.initialize()
  availablePorts.initialize()

  const staticApi = await buildApiServer()
  await staticApi.listen({ port: apiPort })
  const proxy = initializeProxy()

  return { staticApi, proxy }
}

export { BundleFetcher } from './BundleFetcher'
export { PortManager } from './PortManager'
