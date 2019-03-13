import { ApolloServer, makeExecutableSchema, ServerInfo } from 'apollo-server'
const tcpPortUsed = require('tcp-port-used')

const {
  LOWER_PORT_BOUND,
  UPPER_PORT_BOUND
} = process.env

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
export let portRange = initialisePortReferences(
  Number(LOWER_PORT_BOUND),
  Number(UPPER_PORT_BOUND)
)

export function initialisePortReferences (lowerPortBound: number, upperPortBound: number): PortAccess {
  let portRange: PortAccess = {}

  while (lowerPortBound <= upperPortBound) {
    portRange[lowerPortBound] = false
    lowerPortBound++
  }

  return portRange
}

// TODO: This function side-effects portRange and serverTracker. Reconsider
export async function addServerToTracker (contractInfo: Partial<ContractServer>): Promise<void> {
  const [portKey] = Object.entries(portRange).find(([_, inUse]) => inUse === false)
  if (!portKey) {
    throw new Error('Port range consumed')
  }

  const port = Number(portKey)
  portRange[port] = true

  const portAvailable = await tcpPortUsed.check(port, '127.0.0.1')
  if (!portAvailable) {
    return addServerToTracker(contractInfo)
  }

  const graphQlInstance = await new ApolloServer({
    schema: makeExecutableSchema(contractInfo.graphQlSchema),
    introspection: true
  }).listen({ port })

  const server = {
    ...contractInfo,
    port: port,
    graphQlInstance
  } as ContractServer

  serverTracker.push(server)
}

export function removeServerFromTracker (contractAddress: string) {
  const contractServer = findServerByAddress(contractAddress)
  return new Promise((resolve, reject) => {
    contractServer.graphQlInstance.server.close((err: Error) => {
      if (err) return reject(err)
      serverTracker = serverTracker.filter((st) => st.contractAddress !== contractAddress)
      resolve()
    })
  })
}

export function findServerByAddress (contractAddress: string): ContractServer {
  return serverTracker.find(server => server.contractAddress === contractAddress)
}

export function getLoadedContracts (): Partial<ContractServer>[] {
  return serverTracker.map(st => {
    return {
      contractAddress: st.contractAddress,
      engine: st.engine
    }
  })
}
