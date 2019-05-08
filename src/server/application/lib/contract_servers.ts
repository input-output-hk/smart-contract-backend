import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { ContractServer, availablePorts, contractServers } from '../../infrastructure/storage'
import { unloadBundle } from '../../infrastructure/bundle_fetcher'
import { initializeContractExecutionController } from './initialize_execution_controller'
const tcpPortUsed = require('tcp-port-used')

export async function addServer (contractInfo: Partial<ContractServer>): Promise<void> {
  const ports = availablePorts.findAll()
  const portEntry = Object.entries(ports).find(([_, inUse]) => inUse === false)
  if (!portEntry) {
    throw new Error('Port range consumed')
  }

  const port = Number(portEntry[0])
  availablePorts.update(port, true)

  const portInUse = await tcpPortUsed.check(port, '127.0.0.1')
  if (portInUse) {
    return addServer(contractInfo)
  }

  const executionController = initializeContractExecutionController(contractInfo.engine)

  const graphQlInstance = await new ApolloServer({
    schema: makeExecutableSchema(contractInfo.graphQlSchema(executionController)),
    introspection: true
  }).listen({ port })

  const server = {
    ...contractInfo,
    port: port,
    graphQlInstance
  } as ContractServer

  contractServers.create(server)
}

export function closeAndRemoveServer (contractAddress: string) {
  const contractServer = contractServers.find(contractAddress)
  return new Promise((resolve, reject) => {
    contractServer.graphQlInstance.server.close(async (err: Error) => {
      if (err) return reject(err)
      contractServers.remove(contractAddress)
      await unloadBundle(contractAddress)
      resolve()
    })
  })
}

export function getInitializedContracts (): Partial<ContractServer>[] {
  const servers = contractServers.findAll()
  return servers.map(st => {
    return {
      contractAddress: st.contractAddress,
      engine: st.engine
    }
  })
}
