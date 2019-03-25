import { PubSub } from 'apollo-server'
import { buildApiServer } from './lib/static_server'
import { contractServers, availablePorts } from '../infrastructure/storage'
import { initializeProxy } from './lib/proxy'
import { Server } from 'http'
import { ApolloServer } from 'apollo-server-express'

export async function bootApi (cardanoApiPort: number): Promise<{ staticApi: ApolloServer, proxy: Server }> {
  contractServers.initialize()
  availablePorts.initialize()

  const staticApi = await buildApiServer(new PubSub())
  await staticApi.listen({ port: cardanoApiPort })
  const proxy = initializeProxy()

  return { staticApi, proxy }
}
