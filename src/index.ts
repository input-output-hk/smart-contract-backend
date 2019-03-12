import { PubSub } from 'apollo-server'
import { buildApiServer } from './server'

const {
  CARDANO_API_PORT,
  CONTRACT_PROXY_PORT,
  EXECUTION_SERVICE_URI,
  FIRST_CONTRACT_SERVICE_PORT
} = process.env

if (
  !CARDANO_API_PORT ||
  !CONTRACT_PROXY_PORT ||
  !EXECUTION_SERVICE_URI ||
  !FIRST_CONTRACT_SERVICE_PORT
) {
  throw new Error('Required ENVs not set')
}

buildApiServer(new PubSub())
  .listen({ port: CARDANO_API_PORT })
  .then(({ url }) => console.log(`🚀 Cardano API ready at ${url}`))