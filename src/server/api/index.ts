import { PubSub } from 'apollo-server'
import { buildApiServer } from './lib/static_server'
import { contractServers, availablePorts } from '../infrastructure/storage'
import { initializeProxy } from './lib/proxy'
import { Server } from 'http'
import { ApolloServer } from 'apollo-server-express'

export async function configureApi (): Promise<{ staticApi: ApolloServer, proxy: Server }> {
  const { CARDANO_API_PORT } = process.env

  contractServers.initialize()
  availablePorts.initialize()

  const staticApi = await buildApiServer(new PubSub())
  await staticApi.listen({ port: CARDANO_API_PORT })
  const proxy = initializeProxy()

  return { staticApi, proxy }
}

export function bootApi () {
  const {
    CARDANO_API_PORT,
    CONTRACT_PROXY_PORT,
    EXECUTION_SERVICE_URI,
    CONTRACT_SERVER_LOWER_PORT_BOUND,
    CONTRACT_SERVER_UPPER_PORT_BOUND
  } = process.env

  if (
    !CARDANO_API_PORT ||
    !CONTRACT_PROXY_PORT ||
    !EXECUTION_SERVICE_URI ||
    !CONTRACT_SERVER_LOWER_PORT_BOUND ||
    !CONTRACT_SERVER_UPPER_PORT_BOUND
  ) {
    throw new Error('Required ENVs not set')
  }

  configureApi()
}
