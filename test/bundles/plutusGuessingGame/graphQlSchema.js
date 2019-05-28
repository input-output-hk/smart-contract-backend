module.exports = function (controller) {
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
                "value": "startGame"
              },
              "arguments": [],
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
                },
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
                    "value": "originatorPk"
                  },
                  "type": {
                    "kind": "NamedType",
                    "name": {
                      "kind": "Name",
                      "value": "String"
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
            },
            {
              "kind": "FieldDefinition",
              "name": {
                "kind": "Name",
                "value": "guess"
              },
              "arguments": [
                {
                  "kind": "InputValueDefinition",
                  "name": {
                    "kind": "Name",
                    "value": "word"
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
                    "value": "orgininatorPk"
                  },
                  "type": {
                    "kind": "NamedType",
                    "name": {
                      "kind": "Name",
                      "value": "String"
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
        "end": 210
      }
    },
    resolvers: {
      Query: {
        stub () {
          return true
        }
      },
      Mutation: {
        startGame () {
          const instruction = {
            method: 'initialise',
            contractAddress: 'plutusGuessingGame',
          }

          return controller.execute(instruction)
            .then(res => JSON.stringify(res))
        },
        lock (_, args) {
          const { secretWord, amount } = args
          const instruction = {
            method: 'lock',
            contractAddress: 'plutusGuessingGame',
            methodArguments: { secretWord, amount },
            originatorPk: args.originatorPk
          }
          return controller.execute(instruction)
            .then(res => JSON.stringify(res))
        }
      }
    }
  }
}
