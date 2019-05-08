import { bootApi } from './application'

const {
  API_PORT,
  CONTRACT_PROXY_PORT,
  EXECUTION_SERVICE_URI,
  CONTRACT_SERVER_LOWER_PORT_BOUND,
  CONTRACT_SERVER_UPPER_PORT_BOUND,
  REDIS_HOST,
  REDIS_PORT
} = process.env

if (
  !API_PORT ||
  !CONTRACT_PROXY_PORT ||
  !EXECUTION_SERVICE_URI ||
  !CONTRACT_SERVER_LOWER_PORT_BOUND ||
  !CONTRACT_SERVER_UPPER_PORT_BOUND ||
  !REDIS_HOST ||
  !REDIS_PORT
) {
  throw new Error('Required ENVs not set')
}

bootApi(Number(API_PORT))
