import * as http from 'http'
import * as express from 'express'
import { AddressInfo } from 'net'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema, IExecutableSchemaDefinition } from 'apollo-server'
import { Contract } from '../core'
import { PortManager } from '.'
import { listen } from '../lib/express'

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
      if (servers.has(contractAddress)) return true
      const allocation = await portManager.getAvailablePort()
      // Handling the express app is necessary since ApolloServer does not reject the 'listen' promise
      // when a connection error occurs
      const app = express()
      const apolloServer = new ApolloServer({
        schema: makeExecutableSchema(graphQlSchema),
        introspection: true
      })
      apolloServer.applyMiddleware({ app, path: '/graphql' })
      try {
        const server = await listen(app, allocation.portNumber)
        servers.set(contractAddress, server)
        return true
      } catch (error) {
        if (error.code === 'EADDRINUSE') {
          return this.deploy(contractAddress, graphQlSchema)
        }
        return false
      }
    },
    async tearDown (contractAddress: Contract['address']): Promise<boolean> {
      const serverInfo = servers.get(contractAddress)
      if (!serverInfo) return false
      await shutdownServer(contractAddress, serverInfo)
      return true
    },
    async closeAllServers () {
      await Promise.all([...servers.entries()].map(([contractAddress, server]) => {
        return shutdownServer(contractAddress, server)
      }))
      return true
    }
  }
}
