import fetch from 'cross-fetch'
import { bootApi } from '..'
import { ApolloServer, gql } from 'apollo-server'
import { Server } from 'http'
import { contractServers } from '../../infrastructure/storage'
import { closeAndRemoveServer } from '../lib/contract_servers'
import { expect } from 'chai'
import { execute, makePromise, GraphQLRequest } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
const nock = require('nock')
const { createTestClient } = require('apollo-server-testing')

describe('Integration Suite', () => {
  let staticApi: ApolloServer
  let proxyServer: Server
  const bundle = 'H4sIAMuqiVwAA+2UTW/bMAyGe/avEHTpBhSFnDguEGC3YscORXsbdlBsOlYmS4Ekpy2G/PdZcpLZTpxclgED+FwEkSLFVx9cGr4un+VLVkLF71f25gowxtIkIX58SGdhZJN27onTZEbiaZJMppPZhE0Ji2dTNrsh7BrFDKmt46YpxfJqBdZpNbKuWVYUZ/K0Wshh/E+odF5LuIf3tTbOki/kV0SI+1jDIxR2HmaE0J9C5XRO6KPO6gqUo3etPYdCKOGEVrZxfw9GsgvqBX5brCBzr23eXcguSVineAV03onsxD55313Xs+Gy9svpcw3mgx5c205GoRyYgmcQKvvR8eTCNLWIzbGnECDzrpK+ml5VX/3ak2LGBJ0X1RdWgpSa9tzbwQ7cLMNdDFUEp7/Bs9tr9VRL6S/kuIqR4EH1+cngcemX5feP4MUZoZb0aM02OjcfntLgsqNTcXtra9kdJZU666igvk24xsD2G1AIUh7iaB8b9jZgtdyAOXye8Eb/JAo3++lz53gMuNoocvumjcxve7WErNH2mv8fnG/7o23vb3Ch/7OYpYf+z1LW9P+EJTH2/3+Bf4bNS14KFT7dWtautuFnUniHrHZ8IeG1bQj0jduq9ZXclt7CF1lOr/pAEQRBEARBEARBEARBEARBEARBEARBEAS5yG9u53GoACgAAA=='

  beforeEach(async () => {
    nock('http://localhost:22222')
      .get('/')
      .reply(200, { bundle })

    process.env.API_PORT = '5001'
    process.env.CONTRACT_PROXY_PORT = '5002'
    process.env.EXECUTION_SERVICE_URI = ''
    process.env.CONTRACT_SERVER_LOWER_PORT_BOUND = '10000'
    process.env.CONTRACT_SERVER_UPPER_PORT_BOUND = '10100'

    const servers = await bootApi(5001)
    staticApi = servers.staticApi as ApolloServer
    proxyServer = servers.proxy
  })

  afterEach(async () => {
    staticApi.stop()
    proxyServer.close()
    const contractServersInstances = contractServers.findAll()
    await Promise.all(contractServersInstances.map(s => closeAndRemoveServer(s.contractAddress)))
    nock.cleanAll()
  })

  describe('Static Server', () => {
    describe('Query', () => {
      describe('Contracts', () => {
        it('returns an empty array if there are no contracts initialized', async () => {
          const { query } = createTestClient(staticApi)
          const result = await query({
            query: gql`query {
              contracts {
                engine,
                contractAddress
              }
            }`
          })

          expect(result.data.contracts).to.eql([])
        })

        it('returns initialized contracts', async () => {
          const { query } = createTestClient(staticApi)
          await query({
            query: gql`mutation {
              initializeContract(contractAddress: "abcd", bundleLocation: "http://localhost:22222")
            }`
          })

          const result = await query({
            query: gql`query {
              contracts {
                engine,
                contractAddress
              }
            }`
          })

          expect(result.data.contracts).to.eql([{
            contractAddress: 'abcd',
            engine: 'plutus'
          }])
        })
      })
    })

    describe(('Mutation'), () => {
      describe('initializeContract', () => {
        it('creates a contract API server that is accessible through the proxy', async () => {
          const { query } = createTestClient(staticApi)
          await query({
            query: gql`mutation {
              initializeContract(contractAddress: "abcd", bundleLocation: "http://localhost:22222")
            }`
          })

          const link = new HttpLink({ uri: 'http://localhost:5002/abcd', fetch })
          const operation: GraphQLRequest = {
            query: gql`query {
              hello
            }`
          }

          const result = await makePromise(execute(link, operation))
          expect(result.data.hello).to.eql('world')
        })

        it('errors when the bundle is not available', async () => {
          const { query } = createTestClient(staticApi)
          const result = await query({
            query: gql`mutation {
              initializeContract(contractAddress: "abcd", bundleLocation: "http://localhost:32222")
            }`
          })

          expect(result.errors[0].message).to.eql('Bundle not available at http://localhost:32222')
        })
      })
    })
  })
})
