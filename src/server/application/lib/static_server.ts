import { ApolloServer, gql } from 'apollo-server'
import axios from 'axios'
import { getInitializedContracts, addServer } from './contract_servers'
import { loadBundle } from '../../infrastructure/bundle_fetcher'
import { contractServers } from '../../infrastructure/storage'
import { initializeContractEngine } from './initialize_contract'
import { getPubSubClient, PubSubTopics } from '../../infrastructure/pubsub'

const {
  EXECUTION_SERVICE_URI
} = process.env

export function buildApiServer () {
  const pubSubClient = getPubSubClient()

  return new ApolloServer({
    typeDefs: gql`
      type SigningRequest {
        transaction: String!
      }
      type Contract {
        engine: String
        contractAddress: String
      }
      type Query {
        contracts: [Contract]!
      }
      type Mutation {
        initializeContract(contractAddress: String!, bundleLocation: String!): Boolean
        submitTransaction(signedTransaction: String!, engine: String!): Boolean
      }
      type Subscription {
        transactionSigningRequest(publicKey: String!): SigningRequest
      }
    `,
    resolvers: {
      Query: {
        contracts () {
          return getInitializedContracts()
        }
      },
      Mutation: {
        submitTransaction (_: any, args: any) {
          return axios.post(`${EXECUTION_SERVICE_URI}/submitTransaction`, args)
            .then(() => true)
            .catch(() => false)
        },
        initializeContract (_: any, { contractAddress, bundleLocation }: { contractAddress: string, bundleLocation: string }) {
          const server = contractServers.find(contractAddress)
          if (server) {
            return true
          }

          return loadBundle(contractAddress, bundleLocation)
            .then(({ graphQlSchema, engine }) => addServer({ graphQlSchema, engine, contractAddress }))
            .then(() => initializeContractEngine(contractAddress))
            .then(() => true)
        }
      },
      Subscription: {
        transactionSigningRequest: {
          subscribe: (_: any, { publicKey }: { publicKey: string }) => pubSubClient.asyncIterator(`${PubSubTopics.SIGNATURE_REQUIRED}.${publicKey}`)
        }
      }
    },
    introspection: true
  })
}
