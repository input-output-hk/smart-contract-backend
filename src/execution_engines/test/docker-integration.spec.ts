import { expect } from 'chai'
import { configureApi, bootApi } from '../api'
import * as request from 'supertest'
import { Server } from 'http'
import { loadContainer, initializeDockerClient, findContainerId } from '../docker/docker-api'
import { ExecutionEngines } from '../ExecutionEngine'
import { getConfig } from '../config'
import { MissingConfig } from '../errors'
const MOCK_IMAGE = 'samjeston/smart_contract_server_mock'

describe('Docker Execution API Integration', () => {
  let app: Server

  beforeEach(async () => {
    process.env.EXECUTION_ENGINE = ExecutionEngines.docker
    process.env.EXECUTION_API_PORT = '4100'
    process.env.CONTAINER_LOWER_PORT_BOUND = '4200'
    process.env.CONTAINER_UPPER_PORT_BOUND = '4300'
    app = await configureApi().listen(4100)
  })

  afterEach(async () => {
    app.close()
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    const testContainers = containers.filter(container => container.Image === MOCK_IMAGE)
    await Promise.all(testContainers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('bootApi', () => {
    it('throws an error when env config is missing', () => {
      process.env.CONTAINER_LOWER_PORT_BOUND = ''
      expect(() => bootApi(getConfig())).to.throw(MissingConfig)
    })
  })

  describe('/loadSmartContract', () => {
    it('creates a contract container with the correct name', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: MOCK_IMAGE })
        .set('Accept', 'application/json')
        .expect(204)
        .then(async () => {
          const { containerId } = await findContainerId('abcd')
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
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      return request(app)
        .post('/unloadSmartContract')
        .send({ contractAddress: 'abcd' })
        .set('Accept', 'application/json')
        .expect(204)
        .then(async () => {
          const { containerId } = await findContainerId('abcd')
          expect(!!containerId).to.eql(false)
        })
    })

    it('throws a 400 if contract address is missing in the request body', () => {
      return request(app)
        .post('/unloadSmartContract')
        .send({})
        .set('Accept', 'application/json')
        .expect(400)
    })
  })

  describe('/execute', () => {
    it('successfully executes a method against a running contract', async () => {
      await loadContainer({ dockerImageRepository: MOCK_IMAGE, contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      return request(app)
        .post('/execute/abcd/add')
        .send({ number1: 1, number2: 2 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body.data.success).to.eql(true)
        })
    })

    it('throws a 404 if the contract is not yet loaded', () => {
      return request(app)
        .post('/execute/abcd/add')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
    })
  })
})
