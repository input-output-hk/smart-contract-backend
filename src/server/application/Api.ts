import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { gql, PubSubEngine } from 'apollo-server'
import net from 'net'
import { Bundle, Contract, ContractRepository, Events, ContractExecutionInstruction } from '../../core'
import { ContractApiServerController, ContractController } from '.'
import { ContractNotLoaded } from './errors'
const httpProxy = require('http-proxy')

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
  apiServerController: ReturnType<typeof ContractApiServerController>
  pubSubClient: PubSubEngine
}

export function Api(config: Config) {
  const { apiServerController } = config
  const app = express()
  const contractProxy = httpProxy.createProxyServer({})
  app.use('/contract/:address', (req, res, next) => {
    const { address } = req.params
    if (!apiServerController.servers.has(address)) return next(new ContractNotLoaded())
    const { port } = apiServerController.servers.get(address).address().valueOf() as net.AddressInfo
    contractProxy.web(req, res, { target: `http://localhost:${port}/graphql` })
  })

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
            callContract(contractInstruction: TypeMe!): String
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
        loadContract(_: any, { contractAddress, bundleLocation }: { contractAddress: string, bundleLocation: string }) {
          return contractController.load(contractAddress, bundleLocation)
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
