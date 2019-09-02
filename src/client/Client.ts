import * as isNode from 'detect-node'
import * as WebSocket from 'ws'
import { fetch } from 'cross-fetch'
import gql from 'graphql-tag'
import { ApolloClient, InMemoryCache, HttpLink, split } from 'apollo-boost'
import { Subscription } from 'apollo-client/util/Observable'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'
import { Contract, ContractCallInstruction } from '../core'

export interface Config {
  apiUri: string,
  subscriptionUri: string,
  transactionHandler: (transaction: string, publicKey: string) => void
}

export function Client (config: Config) {
  let signingSubscription: Subscription

  const httpLink = new HttpLink({
    uri: `${config.apiUri}/graphql`,
    fetch
  })

  const envOptions = isNode ? { webSocketImpl: WebSocket } : {}
  const wsLink = new WebSocketLink({
    uri: config.subscriptionUri,
    options: {
      reconnect: true
    },
    ...envOptions
  })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
    }
  })

  const link = errorLink.concat(split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  ))

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: 'network-only' },
      watchQuery: { fetchPolicy: 'network-only' }
    },
    link
  })

  return {
    apolloClient,
    connect (publicKey: string) {
      signingSubscription = apolloClient.subscribe({
        query: gql`subscription {
            transactionSigningRequest(publicKey: "${publicKey}") {
                transaction
            }
        }`
      }).subscribe({
        next (result) {
          const { data: { transactionSigningRequest: { transaction } } } = result
          config.transactionHandler(transaction, publicKey)
        },
        error (err) {
          console.error('err', err)
        }
      })
    },
    disconnect () {
      if (signingSubscription && typeof signingSubscription.unsubscribe === 'function') {
        signingSubscription.unsubscribe()
        signingSubscription = undefined
      }
    },
    async schema () {
      const result = await apolloClient.query({
        query: gql`query { __schema { types { name } } }`
      })
      return result.data
    },
    async contracts () {
      const result = await apolloClient.query({
        query: gql`query { contracts { contractAddress, description }}`
      })
      return result.data.contracts
    },
    async loadContract (
      contractAddress: Contract['address']
    ) {
      const result = await apolloClient.mutate({
        mutation: gql`mutation {
            loadContract(contractAddress: "${contractAddress}", engine: "stub")
        }`
      })
      return result.data
    },
    async unloadContract (address: string) {
      const result = await apolloClient.mutate({
        mutation: gql`mutation {
            unloadContract(contractAddress: "${address}")
        }`
      })
      return result.data
    },
    async callContract (contractInstruction: ContractCallInstruction) {
      return apolloClient.mutate({
        mutation: gql`mutation {
            callContract(contractInstruction: "${contractInstruction}")
        }`
      })
    }
  }
}
