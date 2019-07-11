import { World } from '../support/world'
import { Then } from 'cucumber'
import { expect } from 'chai'

Then('the contract {string} is listed once by the static contract endpoint', async function (contractAddress: string) {
  const world = this as World
  const contracts = await world.client.contracts()
  const targetContracts = contracts.filter((contract: { engine: string, contractAddress: string }) => contract.contractAddress === contractAddress)
  expect(targetContracts.length).to.eql(1)
})