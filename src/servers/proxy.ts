import * as http from 'http'
import { contractServers } from '../storage'
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})

const {
  CARDANO_API_PORT,
  CONTRACT_PROXY_PORT
} = process.env

export function initializeProxy () {
  http.createServer(function (req, res) {
    const url = req.url
    const server = contractServers.find(url.substr(1))

    if (server) {
      proxy.web(req, res, { target: `http://localhost:${server.port}` })
    } else {
      proxy.web(req, res, { target: `http://localhost:${CARDANO_API_PORT}` })
    }
  }).listen(CONTRACT_PROXY_PORT)

  console.log(`Contract Proxy running at ${CONTRACT_PROXY_PORT}`)
}
