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
        const executionEndpoint = process.env.EXECUTION_SERVICE_URI
        const walletEndpoint = process.env.WALLET_SERVICE_URI
        const clientEndpoint = process.env.WALLET_SERVICE_URI

        if (!executionEndpoint || !walletEndpoint || !clientEndpoint) throw new Error('Environment lacks dependencies')

        // Craft execution instruction

        // submit with controller
      }
    }
  }
}