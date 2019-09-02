import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as sinonChai from 'sinon-chai'
import { PubSub } from 'apollo-server'
import { Contract, ContractRepository, Engine, EngineClient } from '../../core'
import { InMemoryRepository } from '../../lib'
import { ContractController } from '.'
import { StubEngineClient } from '../infrastructure'

use(sinonChai)

describe('Contract Controller', () => {
  let repository: ContractRepository
  let engineClients: Map<Engine, EngineClient>
  let controller: ReturnType<typeof ContractController>
  const testContractAddress = 'abcd'

  beforeEach(async () => {
    repository = InMemoryRepository<Contract>()
    engineClients = new Map([[
      Engine.stub,
      StubEngineClient()
    ]])
    controller = ContractController({
      contractDirectory: 'test/bundles/nodejs',
      contractRepository: repository,
      engineClients,
      pubSubClient: new PubSub()
    })
  })

  describe('load', () => {
    let loadExecutable: ReturnType<typeof spy>
    beforeEach(async () => {
      loadExecutable = spy(engineClients.get(Engine.stub), 'loadExecutable')
      expect(await repository.has(testContractAddress)).to.eq(false)
    })
    it('fetches the bundle, adds the contract to the repository & loads the executable', async () => {
      const load = await controller.load(testContractAddress)
      expect(load).to.be.true
      expect(loadExecutable).to.have.been.calledOnce
      expect(await repository.has(testContractAddress)).to.eq(true)
    })
    it('uses the existing repository entry if present', async () => {
      await controller.load(testContractAddress)
      const load = await controller.load(testContractAddress)
      expect(load).to.be.true
      expect(await repository.size()).to.eq(1)
    })
  })

  describe('unload', () => {
    describe('with loaded contracts', () => {
      let unloadExecutable: ReturnType<typeof spy>
      beforeEach(async () => {
        unloadExecutable = spy(engineClients.get(Engine.stub), 'unloadExecutable')
        await controller.load(testContractAddress)
        expect(await repository.has(testContractAddress)).to.eq(true)
      })
      it('Unloads the executable and removes the contract from the repository', async () => {
        const unload = await controller.unload(testContractAddress)
        expect(unload).to.be.true
        expect(unloadExecutable).to.have.been.calledOnce
        expect(await repository.has(testContractAddress)).to.eq(false)
      })
    })
    describe('without loaded contracts', () => {
      it('returns false if the contract is not loaded', async () => {
        const unload = await controller.unload(testContractAddress)
        expect(unload).to.be.false
      })
    })
  })
})
