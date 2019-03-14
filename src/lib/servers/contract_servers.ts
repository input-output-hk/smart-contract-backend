import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { ContractServer, availablePorts, contractServers } from '../storage'
import { unloadBundle } from '../bundles';
const tcpPortUsed = require('tcp-port-used')

export async function addServer(contractInfo: Partial<ContractServer>): Promise<void> {
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

  const graphQlInstance = await new ApolloServer({
    schema: makeExecutableSchema(contractInfo.graphQlSchema),
    introspection: true
  }).listen({ port })

  const server = {
    ...contractInfo,
    port: port,
    graphQlInstance
  } as ContractServer

  contractServers.create(server)
}

export function closeAndRemoveServer(contractAddress: string) {
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

export function getLoadedContracts(): Partial<ContractServer>[] {
  const servers = contractServers.findAll()
  return servers.map(st => {
    return {
      contractAddress: st.contractAddress,
      engine: st.engine
    }
  })
}
