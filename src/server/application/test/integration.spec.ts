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
  const bundle = 'H4sIAAAAAAAAA+0YXW/bNrDP/hWEXpoAQSL5szDQBztGBHdttjjBAG0YAlmibToSaVBkkLbwfx8/ZIWSLMVD4KbbdA8SdV+8O92RPMaQ+efrhOB3xwPbtvvdLhBvZ9Cz5dt29LeCTluMnU63Zw8Gg37bfmc7HafnCPoRbcqAJ8ynwpTX6tG+gOz9E4AZU3NswvcWABbES4ShNQTWJuKMJ9aZwj7BgDN/HsG7rxtFDUnwAKmmrvxkJXH4CbHRbHXlusHUvQp+cT91vd54GbiX9p07WXqfx+jGnXpj94vnfZst0eRpvXbHxGPj9cydBB4dffBms9Uf7ifb+6xV62mmsb+EM7ghCWKEfpVzJX68hgkj+CKJfcruA4IZ9QN2n0D6COl9LASt1vaNwv2vhCX1N6ub6DZYwVguBMeYo77+B/2uo+vfsXt2x3FE/Xc7vXZT/6+FYv3v4mtCTEIewXP4tCGUJeAjWHAcMEQwONH1L4aXssxIFEF6CuR6QSHjFKshAEysDRO4SIbpt6jfB4RDWa4TEvAYYqaqWlFCuEAYSZ2JYPgzRYNMNCf+63wNA3an9adimSrFif1YrkumtCF/LalnedqjH3G1lN1wKNYUg7jNaUaYQbrwA6js/CtHCxEVdqHHfbQFglGY963oX87GK8lf4V61iy+5mXc1YXxuFejb0kQ+XaqfVXZKkZneAursIPiaR5HaK/aYU6mg4EpYoaAuFofEQ/FkMRkTEkEfF8MiYVvCFTHl4BVSIkc2pZ8pho4fn/xfxLauFP4v8t8Pw3+Y/iVltVk7xRvOfpez1ThS78whDuWdwjyeQ+rsTeC9c9fU38FF/LKig4tZsdbGo6SsUo8Zl6nYbirYyoVdhd0fwboir5D6WfOm3eSN5mvy5sC8IRSJHtEXndhvD03yaL4sOLeMIrx8s/wpYP7zh7fqcP+gs1s6ygJtRSTI+WbJppIJlP08nQWVi479oWWqSQ2iMCHRI6RGH6VaFFOrPMifnOZCmLZijHJYMi9zdXfcM3WJQ9HJ/RkQx54krzEQvRkD30F6wDhLB22wFc2hZC/xIvGgXDeNHws/WN8sDcF7fbH0Ph/9GLIVCQVVWFMg7a52RmEoQpNInnlQZNLyo93RbbjX7LyIuY4NlT/nJso8ELeMj4sLcMvnMWKAEZA1xtpK1RkbvHv65nONg5epVydGzE7LP661e26Pfpn1fMl3vDleuP+17U7p/rfT7zf3P6+FQ+5/ry9Gb2RdAw000EADbwl/A9k5DewAHgAA'

  beforeEach(async () => {
    nock('http://localhost:22222')
      .get('/')
      .reply(200, bundle)

    nock('http://localhost:5003')
      .post('/loadSmartContract')
      .reply(201, { data: {} })

    process.env.API_PORT = '5001'
    process.env.CONTRACT_PROXY_PORT = '5002'
    process.env.EXECUTION_SERVICE_URI = '5003'
    process.env.WALLET_SERVICE_URI = '5004'
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
              stub
            }`
          }

          const result = await makePromise(execute(link, operation))
          expect(result.data.stub).to.eql(true)
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
