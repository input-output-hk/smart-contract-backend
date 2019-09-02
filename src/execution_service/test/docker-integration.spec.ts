import { expect } from 'chai'
import * as Docker from 'dockerode'
import * as request from 'supertest'
import * as http from 'http'
import { ExecutionEngines } from '../../core'
import { getConfig } from '../config'
import { ExecutionService } from '../application'
import { DockerClient, DockerExecutionEngineContext } from '../infrastructure'
import { checkPortIsFree } from '../../lib/test'
import { readFileSync } from 'fs-extra'
const MOCK_IMAGE = readFileSync('test/bundles/docker/abcd.tar.gz').toString('base64')

describe('Docker Execution API Integration', () => {
  let executionService: ReturnType<typeof ExecutionService>
  let app: http.Server
  let dockerClient: ReturnType<typeof DockerClient>

  beforeEach(async () => {
    await checkPortIsFree(4100)
    await checkPortIsFree(4200)
    await checkPortIsFree(4201)
    process.env.EXECUTION_ENGINE = ExecutionEngines.docker
    process.env.EXECUTION_API_PORT = '4100'
    process.env.CONTAINER_LOWER_PORT_BOUND = '4200'
    process.env.CONTAINER_UPPER_PORT_BOUND = '4300'
    executionService = ExecutionService(getConfig())
    app = await executionService.boot()
    dockerClient = DockerClient({
      executionContext: DockerExecutionEngineContext.host,
      pipeStdout: false
    })
  })

  afterEach(async () => {
    await executionService.shutdown()
    const docker = new Docker({ socketPath: '/var/run/docker.sock' })
    const containers = await docker.listContainers()
    const testContainers = containers.filter(container => container.Image === 'mock-contract')
    await Promise.all(testContainers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('/loadSmartContract', () => {
    it('creates a contract container with the correct name', async () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: MOCK_IMAGE })
        .set('Accept', 'application/json')
        .expect(204)
        .then(async () => {
          const { containerId } = await dockerClient.findContainerId('abcd')
          expect(!!containerId).to.eql(true)
        })
    })

    it('throws a 400 if contract address is missing in the request body', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ executable: MOCK_IMAGE })
        .set('Accept', 'application/json')
        .expect(400)
    })

    it('throws a 400 if executable is missing in the request body', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd' })
        .set('Accept', 'application/json')
        .expect(400)
    })
  })

  describe('/unloadSmartContract', () => {
    it('removes a contract container with the corresponding name', async () => {
      await dockerClient.loadContainer({ image: MOCK_IMAGE, contractAddress: 'abcd', hostPort: 10000 })

      return request(app)
        .post('/unloadSmartContract')
        .send({ contractAddress: 'abcd' })
        .set('Accept', 'application/json')
        .expect(204)
        .then(async () => {
          const { containerId } = await dockerClient.findContainerId('abcd')
          expect(!!containerId).to.eql(false)
        })
    })

    it('throws a 400 if contract address is missing in the request body', async () => {
      return request(app)
        .post('/unloadSmartContract')
        .send({})
        .set('Accept', 'application/json')
        .expect(400)
    })
  })

  describe('/execute', () => {
    it('successfully executes a method against a running contract', async () => {
      await request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: MOCK_IMAGE })
        .set('Accept', 'application/json')
        .expect(204)

      return request(app)
        .post('/execute/abcd/add')
        .send({ number1: 1, number2: 2 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body.data.data).to.eql(3)
        })
    })

    it('throws a 404 if the contract is not yet loaded', async () => {
      return request(app)
        .post('/execute/abcd/add')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
    })
  })
})
