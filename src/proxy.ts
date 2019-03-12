import * as http from 'http'
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})

const {
  CARDANO_API_PORT,
  CONTRACT_PROXY_PORT,
  FIRST_CONTRACT_SERVICE_PORT,
} = process.env

export let currentPort = parseInt(FIRST_CONTRACT_SERVICE_PORT)

http.createServer(function (req, res) {
  const url = req.url
  const server = findServerByAddress(url.substr(1))

  if (server) {
    proxy.web(req, res, { target: `http://localhost:${server.port}` })
  } else {
    proxy.web(req, res, { target: `http://localhost:${CARDANO_API_PORT}` })
  }
}).listen(CONTRACT_PROXY_PORT)

console.log(`Contract Proxy running at ${CONTRACT_PROXY_PORT}`)

interface ContractServer {
  port: number
  contractAddress: string
  engine: 'plutus' | 'solidity'
  graphQlInstance: any
}

export let serverTracker: ContractServer[] = []

export function addServerToTracker(contractInfo: Partial<ContractServer>) {
  const port = 1
  // Determine first free port in range (https://www.npmjs.com/package/tcp-port-used)
  // Mark that port as used
  // Deploy server
  // Push to mem reference
  const server = {
    ...contractInfo,
    port
  } as ContractServer

  serverTracker.push(server)
}

export function removeServerFromTracker(contractAddress: string) {
  // Find reference
  // Tear down server
  // Update memory and mark port as free in range tracker
}

export function findServerByAddress(contractAddress: string): ContractServer {
  return serverTracker.find(server => server.contractAddress === contractAddress)
}