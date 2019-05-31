import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { IExecutableSchemaDefinition } from 'apollo-server'
import { PortAllocation } from '../../core'
import { AllPortsAllocated } from '../../core/errors'
import { ContractApiServerController, PortMapper, PortMapperConfig } from '.'
import { Repository } from './lib/Repository'
import { InMemoryRepository, StubEngineClient } from '../infrastructure'
import { RogueService, testContracts } from '../test/'

use(chaiAsPromised)

describe('ContractApiServerController', () => {
  const testContract = testContracts[0]
  describe('Full TCP port range available', () => {
    let controller: ReturnType<typeof ContractApiServerController>
    let engineClient: ReturnType<typeof StubEngineClient>
    let portAllocationRepository: Repository<PortAllocation>
    let schema: IExecutableSchemaDefinition
    beforeEach(() => {
      portAllocationRepository = InMemoryRepository<PortAllocation>()
      engineClient = StubEngineClient()
      schema = testContract.graphQLSchema(engineClient)
      controller = ContractApiServerController(
        PortMapper({
          repository: portAllocationRepository,
          range: { lower: 8082, upper: 8084 }
        })
      )
    })
    afterEach(async () => {
      await controller.closeAllServers()
    })

    describe('deploy', () => {
      it("Deploys the contract's GraphQl server using the next port in the range if available", async () => {
        const deploy = await controller.deploy(testContract.address, schema)
        expect(deploy).to.be.true
        expect((await checkServer(8082)).statusText).to.eq('OK')
      })
      it('Returns true if the contract is already deployed', async () => {
        expect(await controller.deploy(testContract.address, schema)).to.be.true
        const deploy = await controller.deploy(testContract.address, schema)
        expect(deploy).to.be.true
        expect((await checkServer(8082)).statusText).to.eq('OK')
      })
    })

    describe('tearDown', () => {
      it('closes the server for the specified contract', async () => {
        await controller.deploy(testContract.address, schema)
        expect((await checkServer(8082)).statusText).to.eq('OK')
        const tearDown = await controller.tearDown(testContract.address)
        expect(tearDown).to.be.true
        await expect(checkServer(8082)).to.be.rejected
      })
      it('returns false if contract not deployed', async () => {
        const tearDown = await controller.tearDown(testContract.address)
        expect(tearDown).to.be.false
      })
    })

    describe('closeAllServers', () => {
      beforeEach(async () => {
        await controller.deploy(testContract.address, schema)
        await controller.deploy('another_contract', schema)
        expect((await checkServer(8082)).statusText).to.eq('OK')
        expect((await checkServer(8083)).statusText).to.eq('OK')
      })
      it('closes all servers ', async () => {
        await controller.closeAllServers()
        await expect(checkServer(8082)).to.be.rejected
        await expect(checkServer(8083)).to.be.rejected
      })
    })
  })
  describe('Rogue services in the allocated TCP port range', () => {
    let controller: ReturnType<typeof ContractApiServerController>
    let engineClient: ReturnType<typeof StubEngineClient>
    let portAllocationRepository: Repository<PortAllocation>
    let schema: IExecutableSchemaDefinition
    let rogueService: ReturnType<typeof RogueService>
    beforeEach(async () => {
      portAllocationRepository = InMemoryRepository<PortAllocation>()
      engineClient = StubEngineClient()
      schema = testContract.graphQLSchema(engineClient)
      controller = ContractApiServerController(
        CollidablePortMapper({
          repository: portAllocationRepository,
          range: { lower: 8082, upper: 8084 }
        })
      )
      rogueService = RogueService()
      await rogueService.listen(8082)
    })
    afterEach(async () => {
      await controller.closeAllServers()
      await rogueService.close()
    })

    it('Requests a new port allocation if a collision occurs when starting the server', async () => {
      const deploy = await controller.deploy(testContract.address, schema)
      expect(deploy).to.be.true
      expect((await checkServer(8083)).statusText).to.eq('OK')
    })
  })
})

function checkServer (port: number) {
  return axios({
    url: `http://localhost:${port}/graphql`,
    method: 'post',
    data: { query: `{ __schema { types { name } } }` }
  })
}

function CollidablePortMapper ({ repository, range }: PortMapperConfig) {
  const startingPoolQty = range.upper - (range.lower - 1)
  return {
    isAvailable: async (): Promise<boolean> => {
      return true
    },
    getAvailablePort: async (): Promise<PortAllocation> => {
      const size = await repository.size()
      if (size === startingPoolQty) throw new AllPortsAllocated(range)
      const portNumber = size === 0
        ? range.lower
        : (await repository.getLast()).portNumber + 1
      const portAllocation = {
        id: portNumber.toString(),
        portNumber
      }
      await repository.add(portAllocation)
      return portAllocation
    },
    releasePort: async (): Promise<boolean> => {
      return true
    }
  }
}
