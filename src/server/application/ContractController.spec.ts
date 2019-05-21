import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as sinonChai from 'sinon-chai'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { ContractController } from './ContractController'
import { Contract, Engine, EngineClient, PortAllocation } from '../core'
import { InMemoryRepository } from '../infrastructure/repositories'
import { HttpTarGzBundleFetcher } from '../infrastructure/bundle_fetcher'
import { StubEngineClient } from '../infrastructure/engine_clients'
import { ContractRepository } from './lib/ContractRepository'
import { testContract } from './test'
import { BundleFetcher, ContractApiServerController, PortManager } from './'

const nock = require('nock')
use(sinonChai)

describe('Contract Controller', () => {
  let apiServerController: ReturnType<typeof ContractApiServerController>
  let bundleFetcher: BundleFetcher
  let repository: ContractRepository
  let engineClients: Map<Engine, EngineClient>
  let controller: ReturnType<typeof ContractController>

  const networkInterface = axios.create()

  beforeEach(async () => {
    const portManager = PortManager({
      repository: InMemoryRepository<PortAllocation>(),
      range: {
        lower: 8080,
        upper: 8082
      }
    })
    apiServerController = ContractApiServerController(portManager)
    repository = InMemoryRepository<Contract>()
    bundleFetcher = HttpTarGzBundleFetcher(networkInterface)
    engineClients = new Map([[
      Engine.stub,
      StubEngineClient(new PubSub())
    ]])
    controller = ContractController({
      apiServerController,
      contractRepository: repository,
      bundleFetcher,
      engineClients
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
