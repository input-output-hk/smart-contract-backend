import { expect } from 'chai'
import axios from 'axios'
import { ContractController } from './ContractController'
import { Contract, Engine, PortAllocation } from '../core'
import { InMemoryRepository } from '../infrastructure/repositories'
import { HttpTarGzBundleFetcher } from '../infrastructure/bundle_fetcher'
import { StubEngineClient } from '../infrastructure/engine_clients'
import { ContractRepository } from './lib/ContractRepository'
import { testContract } from './test'
import { PortManager, ContractApiServerController, BundleFetcher } from './'
const nock = require('nock')

describe('Contract Controller @focus', () => {
  let apiServerController: ReturnType<typeof ContractApiServerController>
  let bundleFetcher: BundleFetcher
  let repository: ContractRepository
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
    controller = ContractController({
      apiServerController,
      contractRepository: repository,
      bundleFetcher,
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]])
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
    beforeEach(async () => {
      expect(await repository.has(testContract.address)).to.eq(false)
    })
    it('fetches the bundle, adds the contract to the repository, then deploys the API server', async () => {
      const load = await controller.load(testContract.address, testContract.location)
      expect(load).to.be.true
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
    beforeEach(async () => {
      expect(await apiServerController.servers.has(testContract.address)).to.eq(false)
      await controller.load(testContract.address, testContract.location)
      expect(await repository.has(testContract.address)).to.eq(true)
    })
    it('tears down the API serve then removes the contract from the repository', async () => {
      const unload = await controller.unload(testContract.address)
      expect(unload).to.be.true
      expect(apiServerController.servers.has(testContract.address)).to.be.false
      expect(await repository.has(testContract.address)).to.eq(false)
    })
  })
})
