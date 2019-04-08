import { setWorldConstructor } from 'cucumber'
import { ApolloClient, InMemoryCache, HttpLink, split } from 'apollo-boost'
import { getMainDefinition } from 'apollo-utilities'
import { fetch } from 'cross-fetch';
import { WebSocketLink } from 'apollo-link-ws'
import * as WebSocket from 'ws'
import gql from 'graphql-tag'
import { Subscription } from 'apollo-client/util/Observable'

class CustomWorld {
  public apolloClient: ApolloClient<any>
  public keySubscription: Subscription

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
    this.keySubscription = this.apolloClient.subscribe({
      query: gql`subscription onTxSigningRequest($publicKey: String!) {
          transactionSigningRequest(publicKey: $publicKey) {
            transaction
          }
      }`,
      variables: { publicKey: pk },
    }).subscribe({
      next({ data: { transactionSigningRequest: { transaction } } }) {
        console.log(transaction)
      },
      error(err) { console.error(err) },
    })
  }

  unsubscribeKey() {
    if (this.keySubscription && typeof this.keySubscription.unsubscribe === 'function') {
      this.keySubscription.unsubscribe()
    }
  }
}

setWorldConstructor(CustomWorld)