module.exports = function (executionController) {
  return {
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
                },
                {
                  "kind": "InputValueDefinition",
                  "name": {
                    "kind": "Name",
                    "value": "originatorPk"
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
          const { number1, number2 } = args
          const instruction = {
            engine: 'plutus',
            method: 'add',
            contractAddress: 'abcd',
            methodArguments: { number1, number2 },
            originatorPk: args.originatorPk
          }

          // Submit to execution controller
          executionController.executeContract(instruction)
        }
      }
    }
  }
}