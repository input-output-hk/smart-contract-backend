import { World } from '../support/world'
import { When } from 'cucumber'

When('I load a contract by address {string}', { timeout: 30000 }, function (address: string) {
  const world = this as World
  return world.loadContract(address)
})
