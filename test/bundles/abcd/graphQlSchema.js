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
              "value": "add"
            },
            "arguments": [
              {
                "kind": "InputValueDefinition",
                "name": {
                  "kind": "Name",
                  "value": "number1"
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
              },
              {
                "kind": "InputValueDefinition",
                "name": {
                  "kind": "Name",
                  "value": "number2"
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
      "end": 108
    }
  },
  resolvers: {
    Query: {
      stub() {
        return true
      }
    },
    Mutation: {
      add(_, args) {
        const contractAddress = 'abcd'
        const executionUrl = process.env.EXECUTION_SERVICE_URI
        const axios = require('axios')
        if (!executionUrl || !axios) throw new Error('Environment lacks dependencies')

        return axios.post(`${executionUrl}/execute/${contractAddress}/add`, args)
          .then(({ data }) => JSON.stringify(data))
      }
    }
  }
}