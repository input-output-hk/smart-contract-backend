import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { gql } from 'apollo-server'
import { Contract, Bundle } from '../core'
import { ContractController } from './ContractController'
import { ContractRepository } from './lib/ContractRepository'

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
}

export function ServiceApi ({ contractController, contractRepository }: Config) {
  const app = express()
  const apolloServer = new ApolloServer({
    typeDefs: gql`
      type Contract {
        engine: String
        contractAddress: String
      }
      type Query {
        contracts: [Contract]!
      }
      type Mutation {
        loadContract(contractAddress: String!, bundleLocation: String!): Boolean
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
      }
    },
    introspection: true
  })
  apolloServer.applyMiddleware({ app })
  return app
}
