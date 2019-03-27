const { gql } = require('apollo-server')

const typeDef = gql`
  type Query {
    stub: Boolean!
  }
  type Mutation {
    lock(secretWord: String!, amount: Int!): String!
  }
`

console.log(JSON.stringify(typeDef, null, 2))