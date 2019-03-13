import { ApolloServer, gql, PubSub } from 'apollo-server'
import axios from 'axios'
import { getLoadedContracts, addServer } from './contract_servers'
import { loadBundle } from '../bundles'
import { contractServers } from '../storage'

const {
  EXECUTION_SERVICE_URI
} = process.env

export function buildApiServer (pubSub: PubSub) {
  return new ApolloServer({
    typeDefs: gql`
      type SigningRequest {
        tx: String!
      }
      type Contract {
        engine: String
        contractAddress: String
      }
      type Query {
        contracts: [Contract]!
      }
      type Mutation {
        initialiseContract(contractAddress: String!, bundleLocation: String!): Boolean
        submitTx(signedTx: String!, engine: String!): Boolean
      }
      type Subscription {
        transactionSigningRequest(publicKey: String!): SigningRequest
      }
    `,
    resolvers: {
      Query: {
        contracts () {
          return getLoadedContracts()
        }
      },
      Mutation: {
        submitTx (_: any, args: any) {
          return axios.post(`${EXECUTION_SERVICE_URI}/submitTx`, args)
            .then(() => true)
            .catch(() => false)
        },
        // TODO: We need to keep track of the number of clients connected to a
        // contact, so we know when we can tear it down and cleanup the file system
        // TODO: Consider a per contract initialisation lock to prevent
        // race conditions whereby we could boot multiple instances
        // of the same contract
        initialiseContract (_: any, { contractAddress, bundleLocation }: { contractAddress: string, bundleLocation: string }) {
          const server = contractServers.find(contractAddress)
          if (server) {
            return true
          }

          return loadBundle(contractAddress, bundleLocation)
            .then(({ graphQlSchema, engine }) => addServer({ graphQlSchema, engine, contractAddress }))
            .then(() => true)
        }
      },
      Subscription: {
        transactionSigningRequest: {
          subscribe: (_: any, { publicKey }: { publicKey: string }) => pubSub.asyncIterator(publicKey)
        }
      }
    },
    introspection: true
  })
}
