import { setWorldConstructor } from 'cucumber'
import { ApolloClient, InMemoryCache, HttpLink, split } from 'apollo-boost'
import { getMainDefinition } from 'apollo-utilities'
import { fetch } from 'cross-fetch';
import { WebSocketLink } from 'apollo-link-ws'
import * as WebSocket from 'ws'
import gql from 'graphql-tag'
import { Subscription } from 'apollo-client/util/Observable'

export class World {
  private apolloClient: ApolloClient<any>
  private keySubscription: Subscription
  public receivedTransactions: { [publicKey: string]: string[] } = {}

  constructor() {
    const { APPLICATION_URI, WS_URI } = process.env

    const httpLink = new HttpLink({
      uri: APPLICATION_URI,
      fetch
    })

    const wsLink = new WebSocketLink({
      uri: WS_URI,
      webSocketImpl: WebSocket,
      options: {
        reconnect: true
      }
    })

    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
      },
      wsLink,
      httpLink
    )

    this.apolloClient = new ApolloClient({ link, cache: new InMemoryCache() })
  }

  subscribeToPublicKey(pk: string) {
    const ctx = this

    this.keySubscription = this.apolloClient.subscribe({
      query: gql`subscription {
        transactionSigningRequest(publicKey: "${pk}") {
          transaction
        }
      }`
    }).subscribe({
      next(data) {
        let accessor = ctx.receivedTransactions[pk]
        if (accessor) {
          accessor.push(data)
        } else {
          ctx.receivedTransactions[pk] = [data]
        }
      },
      error(err) { console.log(err) },
    })
  }

  unsubscribeFromPublicKey() {
    if (this.keySubscription && typeof this.keySubscription.unsubscribe === 'function') {
      this.keySubscription.unsubscribe()
      this.keySubscription = undefined
    }
  }

  initializeContract(address: string) {
    return this.apolloClient.mutate({
      mutation: gql`
        mutation {
          initializeContract(contractAddress: "${address}", bundleLocation: "http://bundle_server:9001/${address}")
        }
      `
    })
  }

  listContracts() {
    return this.apolloClient.query({
      query: gql`
        query {
          contracts {
            engine,
            contractAddress
          }
        }
      `
    })
  }

  executeContract(address: string, method: string, methodArguments: any) {
    const { APPLICATION_URI } = process.env

    const httpLink = new HttpLink({
      uri: `${APPLICATION_URI}/${address}`,
      fetch
    })

    const contractClient = new ApolloClient({ link: httpLink, cache: new InMemoryCache() })
    const argString = Object.entries(methodArguments)
      .reduce((accumulator: string, [key, value]) => {
        const valueString = typeof value === 'string' ? `"${value}"` : `${value}`
        const appendArgs = `${key}: ${valueString}`
        if (!accumulator) {
          return appendArgs
        } else {
          return `${accumulator}, ${appendArgs}`
        }
      }, '')

    return contractClient.mutate({
      mutation: gql`
        mutation {
          ${method}(${argString})
        }
      `
    })
  }

  async validateTransactionReceived(publicKey: string, attempts: number): Promise<boolean> {
    const accessor = this.receivedTransactions[publicKey]
    if (!accessor) {
      if (attempts > 3) {
        return false
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return this.validateTransactionReceived(publicKey, ++attempts)
    }

    if (accessor.length) {
      return true
    }
  }
}

setWorldConstructor(World)