const { gql } = require('apollo-server')

const typeDef = gql`
  type Query {
    stub: Boolean!
  }
  type Mutation {
    add(number1: Int!, number2: Int!): String!
  }
`

console.log(JSON.stringify(typeDef, null, 2))