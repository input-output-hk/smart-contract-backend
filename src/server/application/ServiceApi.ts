import { ApolloServer, gql } from 'apollo-server'
import { ContractController } from './ContractController'
import { ContractRepository } from './lib/ContractRepository'

export type Config = {
  contractController: ReturnType<typeof ContractController>
  contractRepository: ContractRepository
}

export function ServiceApi ({ contractController, contractRepository }: Config) {
  return new ApolloServer({
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
        contracts () {
          return contractRepository.findAll()
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
}
