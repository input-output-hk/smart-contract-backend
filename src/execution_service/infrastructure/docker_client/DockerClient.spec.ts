import { expect } from 'chai'
import * as Docker from 'dockerode'
import axios from 'axios'
import { DockerClient } from './DockerClient'
import { DockerExecutionEngineContext } from '../execution_engines'
import { Contract } from '../../../core'

const MOCK_IMAGE = 'samjeston/smart_contract_server_mock'

describe('DockerClient', () => {
  const dockerSpecItFn = process.env.DOCKER_EXECUTION_ENGINE_CONTEXT === DockerExecutionEngineContext.docker ? it : it.skip
  const hostSpecItFn = process.env.DOCKER_EXECUTION_ENGINE_CONTEXT !== DockerExecutionEngineContext.docker ? it : it.skip
  let dockerClient: ReturnType<typeof DockerClient>

  afterEach(async () => {
    await cleanupTestContainers()
  })

  describe('findContainerPort', () => {
    beforeEach(() => {
      dockerClient = DockerClient({
        executionContext: DockerExecutionEngineContext.host,
        pipeStdout: false
      })
    })
    it('returns the host port mapped to the container', async () => {
      await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', hostPort: 4200 })
      expect(await dockerClient.findContainerPort('abcd')).to.eql(4200)
    })
  })

  describe('loadContainer', () => {
    async function tryLoadingTwice (dockerClient: ReturnType<typeof DockerClient>, contractAddress: Contract['address']): Promise<void> {
      await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress, hostPort: 4200 })
      await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress, hostPort: 4201 })
      const containers = await dockerClient.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(1)
    }

    describe('Docker networking', () => {
      beforeEach(() => {
        dockerClient = DockerClient({
          executionContext: DockerExecutionEngineContext.docker,
          pipeStdout: false
        })
      })
      dockerSpecItFn('successfully boots a container that accepts HTTP on the returned port', async () => {
        await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', hostPort: 4200 })
        const result = await axios.post(`http://abcd:8080/add`, {
          number1: 1,
          number2: 2
        })
        expect(result.status).to.eql(200)
      })
      dockerSpecItFn('does not boot a second container when a container with that address is already running', async () => {
        await tryLoadingTwice(dockerClient, 'abcd')
      })
    })

    describe('Host networking', () => {
      beforeEach(() => {
        dockerClient = DockerClient({
          executionContext: DockerExecutionEngineContext.host,
          pipeStdout: false
        })
      })

      hostSpecItFn('successfully boots a container that accepts HTTP on the returned port', async () => {
        const container = await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', hostPort: 4200 })
        const result = await axios.post(`http://localhost:${container.port}/add`, {
          number1: 1,
          number2: 2
        })
        expect(result.status).to.eql(200)
      })

      hostSpecItFn('does not boot a second container when a container with that address is already running', async () => {
        await tryLoadingTwice(dockerClient, 'abcd')
      })
    })
  })
  describe('unloadContainer', () => {
    beforeEach(() => {
      dockerClient = DockerClient({
        executionContext: DockerExecutionEngineContext.host,
        pipeStdout: false
      })
    })

    it('successfully terminates a contract instance for an address', async () => {
      await dockerClient.loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', hostPort: 4200 })
      await dockerClient.unloadContainer('abcd')
      const containers = await dockerClient.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(0)
    })

    it('resolves successfully if a contract instance for an address does not exist', async () => {
      await dockerClient.unloadContainer('abcd')
      const containers = await dockerClient.listContainers()
      const contractContainers = containers.filter(container => container.Image === MOCK_IMAGE)
      expect(contractContainers.length).to.eql(0)
    })
  })
})

async function cleanupTestContainers () {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })
  const containers = await docker.listContainers({ all: true })
  const testContainers = containers.filter(container => container.Image === MOCK_IMAGE)
  await Promise.all(testContainers.map(async (container) => {
    await docker.getContainer(container.Id).remove({ force: true })
  }))
}
