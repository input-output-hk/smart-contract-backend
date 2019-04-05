import { expect } from 'chai'
import { ContractServer, contractServers } from '..'
import { SmartContractEngine } from '../../../execution_controller/lib/adapter'

describe('contractServers', () => {
  beforeEach(() => {
    contractServers.initialize()
  })

  describe('initialize & findAll', () => {
    it('initializes the server list correctly', () => {
      expect(contractServers.findAll()).to.eql([])
    })
  })

  describe('create', () => {
    it('creates a server and adds it to the list', () => {
      const server: ContractServer = {
        contractAddress: '0xAB',
        engine: SmartContractEngine.solidity,
        port: 100,
        graphQlInstance: undefined,
        graphQlSchema: {}
      }

      contractServers.create(server)
      expect(contractServers.findAll()).to.eql([server])
    })
  })

  describe('find', () => {
    it('can find a server by contract address', () => {
      const server: ContractServer = {
        contractAddress: '0xAB',
        engine: SmartContractEngine.solidity,
        port: 100,
        graphQlInstance: undefined,
        graphQlSchema: {}
      }

      contractServers.create(server)
      expect(contractServers.find('0xAB')).to.eql(server)
    })

    it('returns undefined if the server does not exist', () => {
      expect(contractServers.find('xxxx')).to.eql(undefined)
    })
  })

  describe('remove', () => {
    it('removes an existing contractServer from the server list', () => {
      const server: ContractServer = {
        contractAddress: '0xAB',
        engine: SmartContractEngine.solidity,
        port: 100,
        graphQlInstance: undefined,
        graphQlSchema: {}
      }

      contractServers.create(server)
      contractServers.remove('0xAB')
      expect(contractServers.findAll()).to.eql([])
    })
  })

  describe('update', () => {
    it('throws a no-op error', () => {
      const server = {} as ContractServer
      expect(() => contractServers.update('id', server)).to.throw(/No update operation/)
    })
  })
})
