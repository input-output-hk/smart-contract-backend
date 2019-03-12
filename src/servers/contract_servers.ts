const tcpPortUsed = require('tcp-port-used')
import { ApolloServer, makeExecutableSchema, ServerInfo } from 'apollo-server'

interface ContractServer {
  port: number
  contractAddress: string
  engine: 'plutus' | 'solidity'
  graphQlSchema: any
  graphQlInstance: ServerInfo
}

interface PortAccess {
  [port: number]: boolean
}

export let serverTracker: ContractServer[] = []
export let portRange = initialisePortReferences()

// TODO: Env var these boundaries
export function initialisePortReferences(): PortAccess {
  const upperPortBound = 20000
  let lowerPortBound = 10000
  let portRange: PortAccess = {}

  while (lowerPortBound <= upperPortBound) {
    portRange[lowerPortBound] = false
    lowerPortBound++
  }

  return portRange
}

// TODO: This function side-effects portRange. Reconsider
export async function addServerToTracker(contractInfo: Partial<ContractServer>) {
  const [port, _inUse] = Object.entries(portRange).find(([_, inUse]) => inUse === false)
  if (!port) {
    throw new Error('Port range consumed')
  }

  portRange[port] = true

  const portAvailable = await tcpPortUsed.check(Number(port), '127.0.0.1')
  if (!portAvailable) {
    return addServerToTracker(contractInfo)
  }

  // Deploy server
  const graphQlInstance = await new ApolloServer({
    schema: makeExecutableSchema(contractInfo.graphQlSchema),
    introspection: true
  }).listen({ port })

  const server = {
    ...contractInfo,
    port: Number(port),
    graphQlInstance
  } as ContractServer

  serverTracker.push(server)
}

export function removeServerFromTracker(contractAddress: string) {
  const contractServer = findServerByAddress(contractAddress)
  return new Promise((res, rej) => {
    contractServer.graphQlInstance.server.close((err: Error) => {
      if (err) return rej(err)
      serverTracker = serverTracker.filter((st) => st.contractAddress !== contractAddress)
    })
  })
}

export function findServerByAddress(contractAddress: string): ContractServer {
  return serverTracker.find(server => server.contractAddress === contractAddress)
}

export function getLoadedContracts(): Partial<ContractServer>[] {
  return serverTracker.map(st => {
    return {
      contractAddress: st.contractAddress,
      engine: st.engine
    }
  })
}