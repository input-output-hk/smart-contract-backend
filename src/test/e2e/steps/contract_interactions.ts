import { When, Then, Given } from 'cucumber'
import { World } from '../support/world'
import { expect } from 'chai'

When('I subscribe by public key {string}', function (publicKey: string) {
  const world = this as World
  return world.client.connect(publicKey)
})

When('I call the contract {string} with the method {string}, arguments {string} and public key {string}', function (contractAddress: string, method: string, methodArguments: string, originatorPk: string) {
  const world = this as World
  return world.client.callContract({
    originatorPk,
    contractAddress,
    method,
    methodArguments
  })
})

Given('the contract is not loaded, calling contract {string} with the method {string} and arguments {string} throws an error', async function (contractAddress: string, method: string, methodArgs: string) {
  const world = this as World
  try {
    await world.client.callContract({
      contractAddress,
      method,
      methodArguments: methodArgs
    })
    throw new Error('Invalid error')
  } catch (e) {
    expect(e.message).to.eql('GraphQL error: Contract not loaded. Call /load and then try again')
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
