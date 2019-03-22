import { expect } from 'chai'
import { configureApi, bootApi } from '../api'
import * as request from 'supertest'
import { Server } from 'http'
import { readFileSync } from 'fs'
import { loadContainer, initializeDockerClient, findContainerId } from '../docker-api'
const executable = readFileSync(`${__dirname}/../../test/smart_contract_server_mock/smart_contract_server_base64.txt`)

describe('api', () => {
  let app: Server

  beforeEach(async () => {
    process.env.CONTAINER_LOWER_PORT_BOUND = '4200'
    process.env.CONTAINER_UPPER_PORT_BOUND = '4300'
    app = await configureApi().listen(4100)
  })

  afterEach(async () => {
    app.close()
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    await Promise.all(containers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('bootApi', () => {
    it('throws an error when env config is missing', () => {
      expect(() => bootApi()).to.throw(/Missing environment config/)
    })
  })

  describe('/loadSmartContract', () => {
    it('creates a contract container with the correct name', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: executable.toString() })
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
        .send({ executable: executable.toString() })
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
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

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
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      return request(app)
        .post('/execute')
        .send({ contractAddress: 'abcd', method: 'add', methodArguments: ['1', '2'] })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
          expect(response.body.data.success).to.eql(true)
        })
    })

    it('throws a 400 if contract address is missing in the request body', () => {
      return request(app)
        .post('/execute')
        .send({ method: 'add', methodArguments: ['1', '2'] })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('throws a 400 if method is missing in the request body', () => {
      return request(app)
        .post('/execute')
        .send({ contractAddress: 'abcd', methodArguments: ['1', '2'] })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('throws a 400 if method arguments is missing in the request body', () => {
      return request(app)
        .post('/execute')
        .send({ contractAddress: 'abcd', method: 'add' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
  })
})
