Feature: Contract Loading
  To interact with contracts on the platform
  They must first be loaded
  However loading is provably an idempotent operation

  Scenario Outline: a contract cannot be called without first being loaded
    When I subscribe by public key <pk>
    And I call the contract <address> with the method <method> and arguments <methodArguments> knowing the contract is not initialized
    Then <pk> should not receive a signing request

    Examples:
      | address              | pk                | method | methodArguments                       |
      | "plutusGuessingGame" | "uniquePublicKey" | "add"  | "{\"originatorPk\": \"myPublicKey\"}" |

  Scenario Outline: a contract can be loaded multiple times without error
    When I load a contract by address <address>
    And I load a contract by address <address>
    Then the contract <address> is listed once by the static contract endpoint

    Examples:
      | address |
      | "abcd"  |

# Scenario Outline: multiple contracts can be loaded
#   When I load a contract by address <address1>
#   Then I load a contract by address <address2>

#   Examples:
#     | address1 | address2             |
#     | "abcd"   | "plutusGuessingGame" |