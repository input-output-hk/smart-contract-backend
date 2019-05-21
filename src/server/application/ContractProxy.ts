import * as http from 'http'
import net from 'net'
import { ContractApiServerController } from '.'
const httpProxy = require('http-proxy')

export type Config = {
  apiServerController: ReturnType<typeof ContractApiServerController>
  catchAllUri: string
}

export function ContractProxy (config: Config): http.Server {
  const { apiServerController, catchAllUri } = config
  const proxy = httpProxy.createProxyServer({})
  return http.createServer(function (req, res) {
    const url = req.url
    const address = url.substr(1)
    if (apiServerController.servers.has(address)) {
      const { port } = apiServerController.servers.get(address).address().valueOf() as net.AddressInfo
      proxy.web(req, res, { target: `http://localhost:${port}` })
    } else {
      proxy.web(req, res, { target: catchAllUri })
    }
  })
}
