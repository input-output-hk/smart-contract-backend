import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as sinonChai from 'sinon-chai'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Contract, ContractRepository, Engine, EngineClient, PortAllocation } from '../../core'
import { PortMapper } from '../../lib'
import { BundleFetcher, ContractApiServerController, ContractController } from '.'
import { InMemoryRepository, HttpTarGzBundleFetcher, StubEngineClient } from '../infrastructure'
import { testContracts } from '../test'

const nock = require('nock')
use(sinonChai)

describe('Contract Controller', () => {
  let apiServerController: ReturnType<typeof ContractApiServerController>
  let bundleFetcher: BundleFetcher
  let repository: ContractRepository
  let engineClients: Map<Engine, EngineClient>
  let controller: ReturnType<typeof ContractController>
  const testContract = testContracts[0]
  const networkInterface = axios.create()

  beforeEach(async () => {
    const portMapper = PortMapper({
      repository: InMemoryRepository<PortAllocation>(),
      range: {
        lower: 8082,
        upper: 8084
      }
    })
    apiServerController = ContractApiServerController(portMapper)
    repository = InMemoryRepository<Contract>()
    bundleFetcher = HttpTarGzBundleFetcher(networkInterface)
    engineClients = new Map([[
      Engine.stub,
      StubEngineClient()
    ]])
    controller = ContractController({
      apiServerController,
      contractRepository: repository,
      bundleFetcher,
      engineClients,
      pubSubClient: new PubSub()
    })

    nock(testContract.location)
      .get('/')
      .reply(200, testContract.bundle)
  })

  afterEach(async () => {
    await apiServerController.closeAllServers()
    return nock.cleanAll()
  })

  describe('load', () => {
    let loadExecutable: ReturnType<typeof spy>
    beforeEach(async () => {
      loadExecutable = spy(engineClients.get(Engine.stub), 'loadExecutable')
      expect(await repository.has(testContract.address)).to.eq(false)
    })
    it('fetches the bundle, adds the contract to the repository, loads the executable, then deploys the API server', async () => {
      const load = await controller.load(testContract.address, testContract.location)
      expect(load).to.be.true
      expect(loadExecutable).to.have.been.calledOnce
      expect(apiServerController.servers.has(testContract.address)).to.be.true
      expect(await repository.has(testContract.address)).to.eq(true)
    })
    it('uses the existing repository entry if present, then ensures the API server is deployed', async () => {
      await controller.load(testContract.address, testContract.location)
      const load = await controller.load(testContract.address, testContract.location)
      expect(load).to.be.true
      expect(apiServerController.servers.size).to.eq(1)
      expect(await repository.size()).to.eq(1)
    })
  })

  describe('unload', () => {
    describe('with loaded contracts', () => {
      let unloadExecutable: ReturnType<typeof spy>
      beforeEach(async () => {
        unloadExecutable = spy(engineClients.get(Engine.stub), 'unloadExecutable')
        expect(await apiServerController.servers.has(testContract.address)).to.eq(false)
        await controller.load(testContract.address, testContract.location)
        expect(await repository.has(testContract.address)).to.eq(true)
      })
      it('tears down the API serve, unloads the executable, then removes the contract from the repository', async () => {
        const unload = await controller.unload(testContract.address)
        expect(unload).to.be.true
        expect(unloadExecutable).to.have.been.calledOnce
        expect(apiServerController.servers.has(testContract.address)).to.be.false
        expect(await repository.has(testContract.address)).to.eq(false)
      })
    })
    describe('without loaded contracts', () => {
      it('returns false if the contract is not loaded', async () => {
        const unload = await controller.unload(testContract.address)
        expect(unload).to.be.false
      })
    })
  })
})
