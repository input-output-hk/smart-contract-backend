import { expect } from 'chai'
import { loadContainer, initializeDockerClient, unloadContainer } from '../docker-api'
import axios from 'axios'
const MOCK_IMAGE = 'samjeston/smart_contract_server_mock'

describe('dockerApi', () => {
  const dockerSpecItFn = process.env.RUNTIME === 'docker' ? it : it.skip
  const hostSpecItFn = process.env.RUNTIME !== 'docker' ? it : it.skip

  afterEach(async () => {
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    const testContainers = containers.filter(container => container.Image === MOCK_IMAGE)
    await Promise.all(testContainers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('loadContainer', () => {
    hostSpecItFn('successfully boots a container that accepts HTTP on the returned port -- [host networking]', async () => {
      const { port } = await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const result = await axios.post(`http://localhost:${port}/add`, {
        number1: 1,
        number2: 2
      })

      expect(result.status).to.eql(200)
    })

    dockerSpecItFn('successfully boots a container that accepts HTTP on the returned port -- [docker networking]', async () => {
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const result = await axios.post(`http://abcd:8000/add`, {
        number1: 1,
        number2: 2
      })

      expect(result.status).to.eql(200)
    })

    it('does not boot a second container when a container with that address is already running', async () => {
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(1)
    })
  })

  describe('unloadContainer', () => {
    it('successfully terminates a contract instance for an address', async () => {
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(0)
    })

    it('resolves successfully if a contract instance for an address not exist', async () => {
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(0)
    })
  })
})
