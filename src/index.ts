import { configureApi as bootApi } from './api'

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

bootApi()
