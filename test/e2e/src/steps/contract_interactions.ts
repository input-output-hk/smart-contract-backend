import { When, Then, Given } from 'cucumber'
import { World } from '../support/world'
import { expect } from 'chai'

When('I subscribe by public key {string}', function (publicKey: string) {
  const world = this as World
  return world.subscribeToPublicKey(publicKey)
})

When('I call the contract {string} with the method {string} and arguments {string}', function (contractAddress: string, method: string, methodArguments: string) {
  const world = this as World
  return world.executeContract(contractAddress, method, JSON.parse(methodArguments))
})

Given('the contract is not loaded, calling contract {string} with the method {string} and arguments {string} throws an error', async function (contractAddress: string, method: string, methodArgs: string) {
  const world = this as World
  try {
    await world.executeContract(contractAddress, method, JSON.parse(methodArgs))
    throw new Error('Invalid error')
  } catch (e) {
    expect(e.message).to.eql('Network error: Response not successful: Received status code 404')
  }
})

Then('{string} should receive a signing request', async function (publicKey: string) {
  const world = this as World
  const transactionReceived = await world.validateTransactionReceived(publicKey, 1)
  expect(transactionReceived).to.eql(true)
})

Then('{string} should not receive a signing request', async function (publicKey: string) {
  const world = this as World
  const transactionReceived = await world.validateTransactionReceived(publicKey, 1)
  expect(transactionReceived).to.eql(false)
})