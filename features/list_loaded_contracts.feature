Feature: List Loaded Contracts
  As a client of the platform
  I want to be able to list loaded contracts

  Scenario Outline: a loaded contract is available in the contract list

    When I load a contract by address <address>
    Then the contract <address> is listed once by the static contract endpoint

    Examples:
      | address |
      | "abcd"  |
