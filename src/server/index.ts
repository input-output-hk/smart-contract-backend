import axios from 'axios'
import { Contract, Engine, PortAllocation } from './core'
import { Server } from './application'
import {
  getPubSubClient,
  HttpTarGzBundleFetcher,
  InMemoryRepository,
  PlutusEngineClient
} from './infrastructure'

const {
  SERVICE_API_PORT,
  API_PORT,
  EXECUTION_SERVICE_URI,
  WALLET_SERVICE_URI,
  CONTRACT_SERVER_LOWER_PORT_BOUND,
  CONTRACT_SERVER_UPPER_PORT_BOUND,
  REDIS_HOST,
  REDIS_PORT
} = process.env

if (
  !SERVICE_API_PORT ||
  !API_PORT ||
  !EXECUTION_SERVICE_URI ||
  !WALLET_SERVICE_URI ||
  !CONTRACT_SERVER_LOWER_PORT_BOUND ||
  !CONTRACT_SERVER_UPPER_PORT_BOUND ||
  !REDIS_HOST ||
  !REDIS_PORT
) {
  throw new Error('Required ENVs not set')
}

const networkInterface = axios.create()

Server({
  serviceApi: { port: Number(SERVICE_API_PORT) },
  contractProxy: { port: Number(API_PORT) },
  contractRepository: InMemoryRepository<Contract>(),
  portManagerConfig: {
    repository: InMemoryRepository<PortAllocation>(),
    range: {
      lower: parseInt(CONTRACT_SERVER_LOWER_PORT_BOUND),
      upper: parseInt(CONTRACT_SERVER_UPPER_PORT_BOUND)
    }
  },
  engineClients: new Map([[
    Engine.plutus,
    PlutusEngineClient({
      executionEndpoint: EXECUTION_SERVICE_URI,
      walletEndpoint: WALLET_SERVICE_URI,
      networkInterface
    })
  ]]),
  bundleFetcher: HttpTarGzBundleFetcher(networkInterface),
  pubSubClient: getPubSubClient(REDIS_HOST, parseInt(REDIS_PORT))
}).boot()
  .then(() => console.log('Server booted'))
  .catch((error) => console.error(error.message))
