import * as express from 'express'
import * as bodyParser from 'body-parser'
import { RegisterRoutes } from './routes'

import './controllers/smart-contract'
import { Engines } from './Engine'
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

export function configureApi () {
  const app = express()
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use('/documentation', express.static(swaggerUiAssetPath))
  app.use('/documentation/swagger.json', (_, res) => {
    res.sendFile(process.cwd() + '/dist/swagger.json')
  })

  app.get('/docs', (_, res) => {
    res.redirect('/documentation?url=swagger.json')
  })

  RegisterRoutes(app)

  app.use(function (_req, res, _next) {
    res.status(404).json({ error: 'Route not found' })
  })

  app.use(function (err: any, _req: any, res: any, _next: Function) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.fields })
    }

    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

export function bootApi () {
  const { ENGINE } = process.env
  if (!ENGINE) {
    throw new Error('Engine not provided')
  }

  const enginePort = ENGINE === Engines.docker
    ? checkDockerEngineEnv()
    : checkNodeEngineEnv()

  const app = configureApi()
  const server = app.listen(enginePort, (err: any) => {
    if (err) {
      throw new Error(`Unable to boot API on port ${enginePort}`)
    }

    console.log(`Smart Contract Docker Engine listening on Port ${enginePort}`)
  })

  const { address, port } = server.address().valueOf() as any
  console.log(`API Documentation at ${address}:${port}/docs`)
}

function checkDockerEngineEnv () {
  const { EXECUTION_API_PORT, CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND, RUNTIME } = process.env
  if (!EXECUTION_API_PORT || !CONTAINER_LOWER_PORT_BOUND || !CONTAINER_UPPER_PORT_BOUND || !RUNTIME) {
    throw new Error('Missing environment config')
  }

  return Number(EXECUTION_API_PORT)
}

function checkNodeEngineEnv () {
  const { EXECUTION_API_PORT } = process.env
  if (!EXECUTION_API_PORT) {
    throw new Error('Missing environment config')
  }

  return Number(EXECUTION_API_PORT)
}
