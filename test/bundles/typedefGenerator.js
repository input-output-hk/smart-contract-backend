const { gql } = require('apollo-server')

const typeDef = gql`
  type Query {
    stub: Boolean!
  }
  type Mutation {
    startGame: String!
    lock(amount: Int!, word: String!, originatorPk: String): String!
    guess(word: String!, orgininatorPk: String): String!
  }
`

console.log(JSON.stringify(typeDef, null, 2))