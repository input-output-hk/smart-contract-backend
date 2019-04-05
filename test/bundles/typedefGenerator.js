const { gql } = require('apollo-server')

const typeDef = gql`
  type Query {
    stub: Boolean!
  }
  type Mutation {
    startGame: String!
    lock(amount: Int!, word: String!): String!
    guess(word: String!): String!
  }
`

console.log(JSON.stringify(typeDef, null, 2))