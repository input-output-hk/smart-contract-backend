import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { gql, PubSubEngine } from 'apollo-server'
import { Bundle, Contract, ContractRepository, ContractCallInstruction, Events, Endpoint } from '../../core'
import { ContractController } from '.'
import { ContractNotLoaded } from './errors'
import requireFromString = require('require-from-string')

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
  pubSubClient: PubSubEngine
}

export function Api (config: Config) {
  const app = express()
  app.use((err: Error, _req: express.Request, response: express.Response, next: express.NextFunction) => {
    if (err instanceof ContractNotLoaded) {
      return response.status(404).json({ error: err.message })
    }

    next(err)
  })

  const apolloServer = buildApolloServer(config)
  apolloServer.applyMiddleware({ app, path: '/graphql' })
  return { apolloServer, app }
}

function buildApolloServer ({ contractController, contractRepository, pubSubClient }: Config) {
  return new ApolloServer({
    typeDefs: gql`
        type Contract {
          description: String!
          contractAddress: String!
        }
        type Query {
            contracts: [Contract]!
        }
        input ContractInstruction {
          originatorPk: String
          method: String!
          contractAddress: String!
          methodArguments: String
        }
        type Mutation {
          loadContract(contractAddress: String!): Boolean
          callContract(contractInstruction: ContractInstruction!): String
          unloadContract(contractAddress: String!): Boolean
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
            const schema = requireFromString(bundle.schema)
            const eps: [string, Endpoint<any, any, any>][] = Object.entries(schema)
            const description = eps.reduce((
              acc: {[name: string]: ReturnType<Endpoint<any, any, any>['describe']>},
              [_, ep]
            ) => {
              acc[ep.name] = ep.describe()
              return acc
            }, {})

            return { contractAddress: address, description: JSON.stringify(description) }
          })
        }
      },
      Mutation: {
        loadContract (_: any, { contractAddress }: { contractAddress: string }) {
          return contractController.load(contractAddress)
        },
        unloadContract (_: any, { contractAddress }: { contractAddress: string }) {
          return contractController.unload(contractAddress)
        },
        callContract (_: any, instruction: ContractCallInstruction) {
          return contractController.call(instruction)
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
}
