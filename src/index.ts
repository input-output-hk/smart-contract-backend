import { PubSub } from 'apollo-server'
import { buildApiServer } from './servers/static_server'

const {
  CARDANO_API_PORT,
  CONTRACT_PROXY_PORT,
  EXECUTION_SERVICE_URI,
  LOWER_PORT_BOUND,
  UPPER_PORT_BOUND
} = process.env

if (
  !CARDANO_API_PORT ||
  !CONTRACT_PROXY_PORT ||
  !EXECUTION_SERVICE_URI ||
  !LOWER_PORT_BOUND ||
  !UPPER_PORT_BOUND
) {
  throw new Error('Required ENVs not set')
}

buildApiServer(new PubSub())
  .listen({ port: CARDANO_API_PORT })
  .then(({ url }) => console.log(`🚀 Cardano API ready at ${url}`))
