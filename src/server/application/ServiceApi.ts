import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { gql, PubSubEngine } from 'apollo-server'
import { Bundle, Contract, Events } from '../core'
import { ContractController } from '.'
import { ContractRepository } from './lib/ContractRepository'

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
  pubSubClient: PubSubEngine
}

export function ServiceApi ({ contractController, contractRepository, pubSubClient }: Config) {
  // Handling the express app is necessary since ApolloServer does not reject the 'listen' promise
  // when a connection error occurs
  const app = express()
  const apolloServer = new ApolloServer({
    typeDefs: gql`
      type SigningRequest {
        transaction: String!
      }
      type Contract {
        engine: String!
        contractAddress: String!
      }
      type Query {
        contracts: [Contract]!
      }
      type Mutation {
        loadContract(contractAddress: String!, bundleLocation: String!): Boolean
      }
      type Subscription {
        transactionSigningRequest(publicKey: String!): SigningRequest
      }
    `,
    resolvers: {
      Query: {
        async contracts () {
          const contracts = await contractRepository.findAll()
          return contracts.map(({ address, bundle }: { address: Contract['address'], bundle: Bundle }) => {
            return { contractAddress: address, engine: bundle.meta.engine }
          })
        }
      },
      Mutation: {
        loadContract (_: any, { contractAddress, bundleLocation }: { contractAddress: string, bundleLocation: string }) {
          return contractController.load(contractAddress, bundleLocation)
        }
      },
      Subscription: {
        transactionSigningRequest: {
          subscribe: (_: any, { publicKey }: { publicKey: string }) => pubSubClient.asyncIterator(`${Events.SIGNATURE_REQUIRED}.${publicKey}`)
        }
      }
    },
    introspection: true
  })
  apolloServer.applyMiddleware({ app })
  return app
}
