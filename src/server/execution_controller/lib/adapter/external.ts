import fetch from 'cross-fetch'
import { execute, makePromise, GraphQLRequest } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
const Web3 = require('web3')

export function requestSignature (
  { transaction, publicKey }: { transaction: any, publicKey: string },
  proxyUri: string
) {
  const link = new HttpLink({ uri: proxyUri, fetch })

  const operation: GraphQLRequest = {
    query: gql`mutation {
      requestSignature(transaction: "${escape(JSON.stringify(transaction))}", publicKey: "${publicKey}" )
    }`
  }

  return makePromise(execute(link, operation))
}

export function initializeWeb3Instance (web3Provider: string) {
  if (!web3Provider) {
    throw new Error('Web3 provider not supplied. Solidity not executable')
  }

  return new Web3(web3Provider)
}
