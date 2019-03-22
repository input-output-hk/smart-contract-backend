import * as express from 'express'
import * as bodyParser from 'body-parser'
import { RegisterRoutes } from './routes'

import './controllers/smart-contract'
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

    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

export function bootApi () {
  const { API_PORT, CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND } = process.env

  if (!API_PORT || !CONTAINER_LOWER_PORT_BOUND || !CONTAINER_UPPER_PORT_BOUND) {
    throw new Error('Missing environment config')
  }

  const app = configureApi()
  const server = app.listen(Number(API_PORT), (err: any) => {
    if (err) {
      throw new Error(`Unable to boot API on port ${API_PORT}`)
    }

    console.log(`Smart Contract Docker Engine listening on Port ${API_PORT}`)
  })

  const { address, port } = server.address().valueOf() as any
  console.log(`API Documentation at ${address}:${port}/docs`)
}
