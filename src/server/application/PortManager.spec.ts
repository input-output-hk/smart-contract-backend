import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { createServer, Server } from 'net'
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
    describe('Graceful handling of port collision', () => {
      it('Selects the next available port', async () => {
        const rogueService: Server = createServer()
        rogueService.listen(8082)
        const allocation1 = await portManager.getAvailablePort()
        expect(allocation1.portNumber).to.eq(8083)
        rogueService.close()
      })
      it('Throws an error if all ports are allocated within the configured range are not available on the host', async () => {
        const rogueService: Server = createServer()
        const rogueService2: Server = createServer()
        rogueService.listen(8082)
        rogueService2.listen(8083)
        await expect(portManager.getAvailablePort()).to.eventually.be.rejectedWith(AllPortsAllocated)
        rogueService.close()
        rogueService2.close()
      })
    })
  })

  describe('isAvailable', () => {
    it('Returns true if the port is available', async () => {
      expect(await portManager.isAvailable(8082)).to.be.true
    })
    it('Returns false if the port has been allocated', async () => {
      const allocation1 = await portManager.getAvailablePort()
      expect(allocation1.portNumber).to.eq(8082)
      expect(await portManager.isAvailable(8082)).to.be.false
    })
  })

  describe('releasePort', () => {
    it('Makes the port available to assign again', async () => {
      const allocation1 = await portManager.getAvailablePort()
      expect(allocation1.portNumber).to.eq(8082)
      expect(await portManager.isAvailable(8082)).to.be.false
      const release = await portManager.releasePort(8082)
      expect(release).to.be.true
      expect(await portManager.isAvailable(8082)).to.be.true
    })
  })
})
