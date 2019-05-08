import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { PortManager } from '.'
import { PortAllocation } from '../core'
import { AllPortsAllocated } from '../core/errors'
import { InMemoryRepository } from '../infrastructure/repositories'

use(chaiAsPromised)

describe('Port Manager', () => {
  let portManager: ReturnType<typeof PortManager>
  beforeEach(() => {
    portManager = PortManager({
      repository: InMemoryRepository<PortAllocation>(),
      range: {
        lower: 8082,
        upper: 8083
      }
    })
  })
  describe('getAvailablePort', () => {
    it('Returns the next port if available', async () => {
      const allocation1 = await portManager.getAvailablePort()
      expect(allocation1.portNumber).to.eq(8082)
      const allocation2 = await portManager.getAvailablePort()
      expect(allocation2.portNumber).to.eq(8083)
    })
    it('Throws an error if all ports are allocated within the configured range', async () => {
      const allocation1 = await portManager.getAvailablePort()
      expect(allocation1.portNumber).to.eq(8082)
      const allocation2 = await portManager.getAvailablePort()
      expect(allocation2.portNumber).to.eq(8083)
      await expect(portManager.getAvailablePort()).to.eventually.be.rejectedWith(AllPortsAllocated)
    })
  })
})
