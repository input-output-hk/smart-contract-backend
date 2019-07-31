Feature: Contract Loading
  To interact with contracts on the platform
  As a client of the backend I must first request it be loaded
  So I can then interact with it


  Scenario Outline: a contract throws an error if called before it is loaded
    Given the contract is not loaded, calling contract <address> with the method <method> and arguments <methodArguments> throws an error

    Examples:
      | address              | pk                | method | methodArguments                       |
      | "plutusGuessingGame" | "uniquePublicKey" | "initialise"  | "{\"originatorPk\": \"myPublicKey\"}" |

  Scenario Outline: a contract is loaded only once, with subsequent requests ignored

    When I load a contract by address <address>
    And I load a contract by address <address>
    Then the contract <address> is listed once by the static contract endpoint

    Examples:
      | address |
      | "abcd"  |

  Scenario Outline: multiple contracts can be loaded
    When I load a contract by address <address1>
    Then I load a contract by address <address2>

    Examples:
      | address1 | address2             |
      | "abcd"   | "plutusGuessingGame" |