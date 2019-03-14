import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { getInitializedContracts, closeAndRemoveServer, addServer } from './contract_servers'
import { contractServers, ContractServer, availablePorts } from '../storage'
import { ServerInfo, gql } from 'apollo-server'
use(chaiAsPromised)

describe('contracts', () => {
  describe('getInitializedContracts', () => {
    it('returns configured contract servers instances', () => {
      contractServers.initialize()

      const server: ContractServer = {
        contractAddress: '0xAB',
        engine: 'solidity',
        port: 100,
        graphQlInstance: undefined,
        graphQlSchema: {}
      }

      contractServers.create(server)

      const contracts = getInitializedContracts()
      expect(contracts.length).to.eql(1)
      expect(Object.keys(contracts[0])).to.eql(['contractAddress', 'engine'])
    })
  })

  describe('closeAndRemoveServer', () => {
    it('shuts down the GraphQL instance and remove the server reference', async () => {
      contractServers.initialize()

      const server: ContractServer = {
        contractAddress: '0xAB',
        engine: 'solidity',
        port: 100,
        graphQlInstance: {
          server: {
            close: (callback) => callback()
          }
        } as ServerInfo,
        graphQlSchema: {}
      }

      contractServers.create(server)

      await closeAndRemoveServer('0xAB')
      expect(contractServers.findAll().length).to.eql(0)
    })
  })

  describe('addServer', () => {
    const helloWorldSchema = {
      typeDefs: gql`
          type Query {
            hello: String!
          }
        `,
      resolvers: {
        Query: {
          hello () {
            return 'world'
          }
        }
      }
    }

    beforeEach(() => {
      process.env.LOWER_PORT_BOUND = '10000'
      process.env.UPPER_PORT_BOUND = '10001'
      availablePorts.initialize()
      contractServers.initialize()
    })

    afterEach(async () => {
      process.env.LOWER_PORT_BOUND = ''
      process.env.UPPER_PORT_BOUND = ''
      const servers = contractServers.findAll()
      await Promise.all(servers.map(s => closeAndRemoveServer(s.contractAddress)))
    })

    it('throws an error if no ports are available', async () => {
      // Marking all parts as used
      availablePorts.update(10000, true)
      availablePorts.update(10001, true)

      const contractInfo: Partial<ContractServer> = {
        contractAddress: '0xAB',
        engine: 'solidity',
        graphQlSchema: helloWorldSchema
      }

      const failedServerAddition = addServer(contractInfo)
      await expect(failedServerAddition).to.eventually.be.rejectedWith(/Port range consumed/)
    })

    it('successfully creates a server and adds its reference to contractServers', async () => {
      const contractInfo: Partial<ContractServer> = {
        contractAddress: '0xAB',
        engine: 'solidity',
        graphQlSchema: helloWorldSchema
      }

      await addServer(contractInfo)

      expect(contractServers.find('0xAB').port).to.eql(10000)
    })
  })
})
