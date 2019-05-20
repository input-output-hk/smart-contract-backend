import { execute, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import gql from 'graphql-tag'
import fetch from 'cross-fetch'

export function ServiceApiClient (port: number) {
  const httpLink = new HttpLink({ uri: `http://localhost:${port}/graphql`, fetch })
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
  const link = errorLink.concat(httpLink)
  function request (operation: any): Promise<any> {
    return makePromise(execute(link, operation))
  }
  return {
    async schema () {
      return (await request({
        query: gql`query { __schema { types { name } } }`
      })).data
    },
    async contracts () {
      return (await request({
        query: gql`query { contracts { contractAddress, engine }}`
      })).data.contracts
    },
    async loadContract (contract: { address: string, location: string }) {
      return (await request({
        query: gql`mutation loadContract($contractAddress: String!, $bundleLocation: String!) {
            loadContract(contractAddress: $contractAddress, bundleLocation: $bundleLocation)
        }`,
        variables: {
          contractAddress: contract.address,
          bundleLocation: contract.location
        }
      })).data
    }
  }
}
