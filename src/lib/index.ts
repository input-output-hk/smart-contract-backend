import { PubSub, ServerInfo } from 'apollo-server'
import { buildApiServer } from './servers/static_server'
import { contractServers, availablePorts } from './storage'
import { initializeProxy } from './servers/proxy'
import { Server } from 'http'

const { CARDANO_API_PORT } = process.env

export async function boot (): Promise<{ staticApi: ServerInfo, proxy: Server }> {
  contractServers.initialize()
  availablePorts.initialize()

  const staticApi = await buildApiServer(new PubSub())
    .listen({ port: CARDANO_API_PORT })

  const proxy = initializeProxy()

  return { staticApi, proxy }
}
