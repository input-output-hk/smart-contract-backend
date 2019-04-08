Feature: Contract Execution
  In order to interact with contracts
  As a consumer of the Smart Contract platform
  I want to execute contract endpoints

  Scenario Outline: execution with signature requests
    When I load a contract by address <address>
    And I subscribe by public key <pk>
    And I execute against contract <address> with the method <method> and arguments <methodArguments>
    Then I should receive a signing request against <pk>

    Examples:
      | address | method | methodArguments                    | pk             |
      | "abcd"  | "add"  | "{\"number1\": 1, \"number2\": 2}" | "originatorPk" |