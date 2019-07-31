import axios from 'axios'
import { Contract, Engine, PortAllocation, OperationMode } from '../core'
import { InMemoryRepository } from '../lib'
import { Server } from './application'
import {
  HttpTarGzBundleFetcher,
  PlutusEngineClient,
  MemoryPubSubClient,
  RedisPubSubClient
} from './infrastructure'

const {
  API_PORT,
  EXECUTION_SERVICE_URI,
  WALLET_SERVICE_URI,
  CONTRACT_SERVER_LOWER_PORT_BOUND,
  CONTRACT_SERVER_UPPER_PORT_BOUND,
  OPERATION_MODE,
  REDIS_HOST,
  REDIS_PORT
} = process.env

if (
  !API_PORT ||
  !EXECUTION_SERVICE_URI ||
  !WALLET_SERVICE_URI ||
  !CONTRACT_SERVER_LOWER_PORT_BOUND ||
  !CONTRACT_SERVER_UPPER_PORT_BOUND ||
  !OPERATION_MODE
) {
  throw new Error('Required ENVs not set')
}

const networkInterface = axios.create()

Server({
  apiPort: Number(API_PORT),
  contractRepository: InMemoryRepository<Contract>(),
  portMapperConfig: {
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
  pubSubClient: OPERATION_MODE === OperationMode.distributed
    ? RedisPubSubClient({ host: REDIS_HOST, port: parseInt(REDIS_PORT) })
    : MemoryPubSubClient()
}).boot()
  .then(() => console.log('Server booted'))
  .catch((error) => console.error(error.message))
