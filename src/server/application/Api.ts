import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { gql, PubSubEngine } from 'apollo-server'
import { Bundle, Contract, ContractRepository, ContractExecutionInstruction, ExecutableType, Engine, Events } from '../../core'
import { ContractController } from '.'
import { ContractNotLoaded } from './errors'

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
  pubSubClient: PubSubEngine
}

export function Api(config: Config) {
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

function buildApolloServer({ contractController, contractRepository, pubSubClient }: Config) {
  return new ApolloServer({
    typeDefs: gql`
        type Contract {
            engine: String!
            contractAddress: String!
        }
        type Query {
            contracts: [Contract]!
        }
        input ExecutableInfo {
          type: String!
          engine: String!
        }
        input LoadOpts {
          filePath: String!
        }
        input ContractInstruction {
          originatorPk: String
          method: String!
          contractAddress: String!
          methodArguments: String
        }
        type Mutation {
            loadContract(contractAddress: String!, executableInfo: ExecutableInfo!, loadOpts: LoadOpts): Boolean
            callContract(contractInstruction: ContractInstruction!): String
            unloadContract(contractAddress: String!): Boolean
        }
        type Subscription {
            transactionSigningRequest(publicKey: String!): SigningRequest
        }
    `,
    resolvers: {
      Query: {
        async contracts() {
          const contracts = await contractRepository.findAll()
          return contracts.map(({ address, bundle }: { address: Contract['address'], bundle: Bundle }) => {
            return { contractAddress: address, engine: bundle.meta.engine }
          })
        }
      },
      Mutation: {
        loadContract(_: any, { contractAddress, executableInfo, loadOpts }: { contractAddress: string, executableInfo: { type: ExecutableType, engine: Engine }, loadOpts: {filePath: string} }) {
          return contractController.load(contractAddress, executableInfo, loadOpts)
        },
        unloadContract(_: any, { contractAddress }: { contractAddress: string }) {
          return contractController.unload(contractAddress)
        },
        callContract(_: any, instruction: ContractExecutionInstruction) {
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
