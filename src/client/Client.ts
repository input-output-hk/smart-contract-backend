import * as isNode from 'detect-node'
import * as WebSocket from 'ws'
import { fetch } from 'cross-fetch'
import gql from 'graphql-tag'
import { ApolloClient, InMemoryCache, HttpLink, split } from 'apollo-boost'
import { Subscription } from 'apollo-client/util/Observable'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'

export interface Config {
  apiUri: string,
  subscriptionUri: string,
  transactionHandler: (transaction: string, publicKey: string) => void
}


export function Client (config: Config) {
  let signingSubscription: Subscription

  const httpLink = new HttpLink ({
    uri: `${config.apiUri}/graphql`,
    fetch
  })

  const envOptions = isNode ? {webSocketImpl: WebSocket} : {}
  const wsLink = new WebSocketLink ({
    uri: config.subscriptionUri,
    options: {
      reconnect: true
    },
    ...envOptions
  })

  const errorLink = onError (({graphQLErrors, networkError}) => {
    if (graphQLErrors) {
      graphQLErrors.map (({message, locations, path}) =>
        console.log (
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log (`[Network error]: ${networkError}`)
    }
  })

  const link = errorLink.concat (split (
    ({query}) => {
      const definition = getMainDefinition (query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  ))

  const apolloClient = new ApolloClient ({link, cache: new InMemoryCache ()})

  return {
    apolloClient,
    async connect (publicKey: string) {
      signingSubscription = apolloClient.subscribe ({
        query: gql`subscription {
            transactionSigningRequest(publicKey: "${publicKey}") {
                transaction
            }
        }`
      }).subscribe ({
        next ({data: {transactionSigningRequest: {transaction}}}) {
          config.transactionHandler(transaction, publicKey)
        },
        error (err) {
          console.error ('err', err)
        }
      })
    },
    disconnect () {
      if (signingSubscription && typeof signingSubscription.unsubscribe === 'function') {
        signingSubscription.unsubscribe ()
        signingSubscription = undefined
      }
    },
    async schema () {
      return (await apolloClient.query ({
        query: gql`query { __schema { types { name } } }`
      })).data
    },
    async contracts () {
      return (await apolloClient.query ({
        query: gql`query { contracts { contractAddress, engine }}`
      })).data.contracts
    },
    async loadContract (contract: { address: string, location: string }) {
      return (await apolloClient.mutate ({
        mutation: gql`mutation loadContract($contractAddress: String!, $bundleLocation: String!) {
            loadContract(contractAddress: $contractAddress, bundleLocation: $bundleLocation)
        }`,
        variables: {
          contractAddress: contract.address,
          bundleLocation: contract.location
        }
      })).data
    },
    executeContract (address: string, method: string, methodArguments: any) {
      const httpLink = new HttpLink ({
        uri: `${config.apiUri}/contract/${address}`,
        fetch
      })

      const contractClient = new ApolloClient ({link: httpLink, cache: new InMemoryCache ()})
      const argString = Object.entries (methodArguments)
        .reduce ((accumulator: string, [key, value]) => {
          const valueString = typeof value === 'string' ? `"${value}"` : `${value}`
          const appendArgs = `${key}: ${valueString}`
          if (!accumulator) {
            return appendArgs
          } else {
            return `${accumulator}, ${appendArgs}`
          }
        }, '')

      return contractClient.mutate ({
        mutation: gql`
            mutation {
                ${method}(${argString})
            }
        `
      })
    }
  }
}
