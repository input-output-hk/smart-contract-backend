import { World } from '../support/world'
import { When } from 'cucumber'

When('I load a contract by address {string}', { timeout: 30000 }, function (address: string) {
  const world = this as World
  const bundleServerLocation = process.env.TEST_MODE === 'docker' ? 'http://bundle_server:9001' : 'http://localhost:9001'
  return world.client.loadContract({ address, location: `${bundleServerLocation}/${address}` })
})
