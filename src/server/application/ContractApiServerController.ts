import http from 'http'
import { AddressInfo } from 'net'
import { ApolloServer, makeExecutableSchema, IExecutableSchemaDefinition } from 'apollo-server'
import { PortManager } from '.'
import { Contract } from '../core'

export function ContractApiServerController (portManager: ReturnType<typeof PortManager>) {
  const servers = new Map<Contract['address'], http.Server>()

  function shutdownServer (contractAddress: Contract['address'], server: http.Server) {
    return new Promise((resolve, reject) => {
      const { port } = server.address().valueOf() as AddressInfo
      server.close(async (error) => {
        if (error) return reject(error)
        await portManager.releasePort(port)
        servers.delete(contractAddress)
        resolve(true)
      })
    })
  }

  return {
    servers,
    async deploy (contractAddress: Contract['address'], graphQlSchema: IExecutableSchemaDefinition): Promise<boolean> {
      const allocation = await portManager.getAvailablePort()
      if (servers.has(contractAddress)) return true
      const serverInfo = await new ApolloServer({
        schema: makeExecutableSchema(graphQlSchema),
        introspection: true
      }).listen({ port: allocation.portNumber })
      servers.set(contractAddress, serverInfo.server)
      return true
    },
    async tearDown (contractAddress: Contract['address']): Promise<boolean> {
      const serverInfo = servers.get(contractAddress)
      if (!serverInfo) return false
      await shutdownServer(contractAddress, serverInfo)
      return true
    },
    async closeAllServers () {
      await Promise.all([...servers.entries()].map(([contractAddress, serverInfo]) => {
        return shutdownServer(contractAddress, serverInfo)
      }))
      return true
    }
  }
}
