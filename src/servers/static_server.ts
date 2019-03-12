import { ApolloServer, gql, PubSub } from 'apollo-server'
import { SmartContractEngine } from '../../script_execution/src/adapter'
import axios from 'axios'

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
          contractName: String
          engine: String
          abi: String
          contractAddress: String
        }
        type Query {
            contracts: [Contract]!
        }
        type Mutation {
            addSchema(newSchema: String!, contractAddress: String!, engine: String!, contractName: String!): Boolean
            submitTx(signedTx: String!, engine: String!): Boolean
        }
        type Subscription {
            transactionSigningRequest(publicKey: String!): SigningRequest
        }
    `,
    resolvers: {
      Query: {
        contracts() {
          return serverTracker
        }
      },
      Mutation: {
        submitTx(_, args) {
          return axios.post(`${EXECUTION_SERVICE_URI}/submitTx`, args)
            .then(() => true)
            .catch(() => false)
        },
        addSchema(_, { contractAddress, engine, contractName }: { contractAddress: string, engine: SmartContractEngine, contractName: string }) {
          // Check for existing instance running that contract. If it doesn't exist,
          // create it, otherwise do nothing
          const port = currentPort
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

