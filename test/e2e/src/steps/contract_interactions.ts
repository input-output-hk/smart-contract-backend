import { When, Then } from 'cucumber'
import { World } from '../support/world'

When('I load a contract by address {string}', { timeout: 30000 }, function (address: string) {
  const world = this as World
  return world.initializeContract(address)
})

When('I subscribe by public key {string}', function (publicKey: string) {
  const world = this as World
  return world.subscribeToPublicKey(publicKey)
})

When('I execute against contract {string} with the method {string} and arguments {string}', function (contractAddress: string, method: string, methodArguments: string) {
  const world = this as World
  return world.executeContract(contractAddress, method, JSON.parse(methodArguments))
})

Then('I should receive a signing request against {string}', function (publicKey: string) {
  const world = this as World
  return world.validateTxReceived(publicKey)
})