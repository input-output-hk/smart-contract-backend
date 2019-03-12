import { ApolloServer, gql, PubSub } from 'apollo-server'
import axios from 'axios'
import { getLoadedContracts, findServerByAddress, addServerToTracker } from './contract_servers';
import { loadBundle } from '../bundles';

const {
  EXECUTION_SERVICE_URI
} = process.env

export function buildApiServer(pubSub: PubSub) {
  return new ApolloServer({
    typeDefs: gql`
        type TxInfo {
          key: String
          value: String
        }
        type SigningRequest {
            tx: String!
            txInfo: [TxInfo]
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
        contracts() {
          return getLoadedContracts()
        }
      },
      Mutation: {
        submitTx(_, args) {
          return axios.post(`${EXECUTION_SERVICE_URI}/submitTx`, args)
            .then(() => true)
            .catch(() => false)
        },
        // TODO: We need to keep track of the number of clients connected to a
        // contact, so we know when we can tear it down
        initialiseContract(_, { contractAddress, bundleLocation }: { contractAddress: string, bundleLocation: string }) {
          const server = findServerByAddress(contractAddress)
          if (server) {
            return true
          }

          return loadBundle(contractAddress, bundleLocation)
            .then(({ graphQlSchema, engine }) => addServerToTracker({ graphQlSchema, engine, contractAddress }))
            .then(() => true)
        },
      },
      Subscription: {
        transactionSigningRequest: {
          subscribe: (_, { publicKey }) => pubSub.asyncIterator(publicKey)
        }
      },
    },
    introspection: true
  })
}

