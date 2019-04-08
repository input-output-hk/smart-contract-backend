import { When, Then } from 'cucumber'

When('I load a contract by address {string}', function (address: string) {
  console.log(address)
  return 'skipped'
})

When('I subscribe by public key {string}', function (publicKey: string) {
  console.log(publicKey)
  return 'skipped';
})

When('I execute against contract {string} with the method {string} and arguments {string}', function (contractAddress: string, method: string, methodArguments: string) {
  console.log(contractAddress, method, methodArguments)
  return 'skipped';
})

Then('I should receive a signing request against {string}', function (publicKey: string) {
  console.log(publicKey)
  return 'skipped';
})