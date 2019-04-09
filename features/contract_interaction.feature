Feature: Contract Interaction
  To interact with initialized Smart Contracts
  As a client of the platform
  I want to call the endpoints to access expressed behaviour

  Scenario Outline: contract interaction that generates a transaction

    When I load a contract by address <address>
    And I subscribe by public key <pk>
    And I call the contract <address> with the method <method> and arguments <methodArguments>
    Then <pk> should receive a signing request

    Examples:
      | address | method | methodArguments                                                       | pk            |
      | "abcd"  | "add"  | "{\"number1\": 1, \"number2\": 2, \"originatorPk\": \"myPublicKey\"}" | "myPublicKey" |
