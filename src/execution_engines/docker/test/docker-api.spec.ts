import { expect } from 'chai'
import { loadContainer, initializeDockerClient, unloadContainer } from '../docker-api'
import axios from 'axios'
import { readFileSync } from 'fs'
const executable = readFileSync(`${__dirname}/../../../../test/smart_contract_server_mock/smart_contract_server_base64.txt`)
const TEST_CONTAINER_NAME = 'smart-contract-backend_smart_contract_backend_test'

describe('dockerApi', () => {
  const dockerSpecItFn = process.env.RUNTIME === 'docker' ? it : it.skip
  const hostSpecItFn = process.env.RUNTIME !== 'docker' ? it : it.skip

  afterEach(async () => {
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    const testContainers = containers.filter(container => container.Image !== TEST_CONTAINER_NAME)
    await Promise.all(testContainers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('loadContainer', () => {
    hostSpecItFn('successfully boots a container that accepts HTTP on the returned port -- [host runtime]', async () => {
      const { port } = await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const result = await axios.post(`http://localhost:${port}`, {
        method: 'add',
        method_arguments: ['1', '2']
      })

      expect(result.status).to.eql(200)
    })

    dockerSpecItFn('successfully boots a container that accepts HTTP on the returned port -- [docker runtime]', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const result = await axios.post(`http://abcd:8000`, {
        method: 'add',
        method_arguments: ['1', '2']
      })

      expect(result.status).to.eql(200)
    })

    it('does not boot a second container when a container with that address is already running -- [host runtime]', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image !== TEST_CONTAINER_NAME)
      expect(contractContainers.length).to.eql(1)
    })
  })

  describe('unloadContainer', () => {
    it('successfully terminates a contract instance for an address', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image !== TEST_CONTAINER_NAME)
      expect(contractContainers.length).to.eql(0)
    })

    it('resolves successfully if a contract instance for an address not exist', async () => {
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      const contractContainers = containers.filter(container => container.Image !== TEST_CONTAINER_NAME)
      expect(contractContainers.length).to.eql(0)
    })
  })
})
