import http from 'http'
import { AddressInfo } from 'net'
import { ExecutionService } from './application'
import { getConfig } from './config'

const executionService = ExecutionService(getConfig())

executionService.boot()
  .then((apiServer: http.Server) => {
    const { address, port } = apiServer.address().valueOf() as AddressInfo
    console.log(`Execution service:${executionService.engineName} listening on port ${port}`)
    console.log(`API Documentation at ${address}:${port}/docs`)
  })
