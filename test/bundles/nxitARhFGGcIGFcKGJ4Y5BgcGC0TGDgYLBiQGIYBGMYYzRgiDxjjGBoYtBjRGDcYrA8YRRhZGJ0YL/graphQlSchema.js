module.exports = {
  typeDefs: {
    "kind": "Document",
    "definitions": [
      {
        "kind": "ObjectTypeDefinition",
        "name": {
          "kind": "Name",
          "value": "Query"
        },
        "interfaces": [],
        "directives": [],
        "fields": [
          {
            "kind": "FieldDefinition",
            "name": {
              "kind": "Name",
              "value": "stub"
            },
            "arguments": [],
            "type": {
              "kind": "NonNullType",
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "Boolean"
                }
              }
            },
            "directives": []
          }
        ]
      },
      {
        "kind": "ObjectTypeDefinition",
        "name": {
          "kind": "Name",
          "value": "Mutation"
        },
        "interfaces": [],
        "directives": [],
        "fields": [
          {
            "kind": "FieldDefinition",
            "name": {
              "kind": "Name",
              "value": "lock"
            },
            "arguments": [
              {
                "kind": "InputValueDefinition",
                "name": {
                  "kind": "Name",
                  "value": "secretWord"
                },
                "type": {
                  "kind": "NonNullType",
                  "type": {
                    "kind": "NamedType",
                    "name": {
                      "kind": "Name",
                      "value": "String"
                    }
                  }
                },
                "directives": []
              },
              {
                "kind": "InputValueDefinition",
                "name": {
                  "kind": "Name",
                  "value": "amount"
                },
                "type": {
                  "kind": "NonNullType",
                  "type": {
                    "kind": "NamedType",
                    "name": {
                      "kind": "Name",
                      "value": "Int"
                    }
                  }
                },
                "directives": []
              }
            ],
            "type": {
              "kind": "NonNullType",
              "type": {
                "kind": "NamedType",
                "name": {
                  "kind": "Name",
                  "value": "String"
                }
              }
            },
            "directives": []
          }
        ]
      }
    ],
    "loc": {
      "start": 0,
      "end": 114
    }
  },
  resolvers: {
    Query: {
      stub() {
        return true
      }
    },
    Mutation: {
      lock(_, { secretWord, amount }) {
        const contractAddress = 'nxitARhFGGcIGFcKGJ4Y5BgcGC0TGDgYLBiQGIYBGMYYzRgiDxjjGBoYtBjRGDcYrA8YRRhZGJ0YL'
        const executionUrl = process.env.EXECUTION_SERVICE_URI
        const axios = require('axios')
        if (!executionUrl || !axios) throw new Error('Environment lacks dependencies')

        return axios.post(`${EXECUTION_URL}/${contractAddress}/lock`, { secretWord, amount })
          .then(({ data }) => data)
      }
    }
  }
}