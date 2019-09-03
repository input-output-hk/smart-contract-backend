// This entrypoint is for operation in a single process when distributed
// to client machines
const {
  API_PORT,
  WALLET_SERVICE_URI,
  EXECUTION_SERVICE_URI,
  CONTRACT_SERVER_LOWER_PORT_BOUND,
  CONTRACT_SERVER_UPPER_PORT_BOUND,
  EXECUTION_API_PORT,
  CONTAINER_LOWER_PORT_BOUND,
  CONTAINER_UPPER_PORT_BOUND,
  EXECUTION_ENGINE,
  OPERATION_MODE,
  CONTRACT_DIRECTORY
} = process.env

// Server ENVs
process.env.API_PORT = API_PORT || '8081'
process.env.WALLET_SERVICE_URI = WALLET_SERVICE_URI || 'http://localhost:0000'
process.env.EXECUTION_SERVICE_URI = EXECUTION_SERVICE_URI || 'http://localhost:9000'
process.env.CONTRACT_SERVER_LOWER_PORT_BOUND = CONTRACT_SERVER_LOWER_PORT_BOUND || '8082'
process.env.CONTRACT_SERVER_UPPER_PORT_BOUND = CONTRACT_SERVER_UPPER_PORT_BOUND || '8900'
process.env.OPERATION_MODE = OPERATION_MODE || 'singleProcess'
process.env.CONTRACT_DIRECTORY = CONTRACT_DIRECTORY || 'test/bundles/nodejs'

// Execution Engine ENVs
process.env.EXECUTION_API_PORT = EXECUTION_API_PORT || '9000'
process.env.CONTAINER_LOWER_PORT_BOUND = CONTAINER_LOWER_PORT_BOUND || '11000'
process.env.CONTAINER_UPPER_PORT_BOUND = CONTAINER_UPPER_PORT_BOUND || '12000'
process.env.EXECUTION_ENGINE = EXECUTION_ENGINE || 'nodejs'

require('./execution_service')
require('./server')
