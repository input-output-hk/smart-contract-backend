import { expect } from 'chai'
import { configureApi, bootApi } from '../api'
import * as request from 'supertest'
import { Server } from 'http'
import NodeEngine from '../node_js'
import { Engines } from '../Engine'

describe('Node Execution API Integration', () => {
  let app: Server
  const mockModule = '{ "foobar": "(args) => { return {result: args.number1 + args.number2 }}" }'
  const mockAddress = 'abcd'

  beforeEach(async () => {
    process.env.ENGINE = Engines.nodejs
    app = await configureApi().listen(4100)
  })

  afterEach(async () => {
    app.close()
    await NodeEngine.unload({ contractAddress: mockAddress })
  })

  describe('bootApi', () => {
    it('throws an error when env config is missing', () => {
      process.env.EXECUTION_API_PORT = ''
      expect(() => bootApi()).to.throw(/Missing environment config/)
    })
  })

  describe('/loadSmartContract', () => {
    it('returns a healthy status code when called with the correct arguments', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: mockModule })
        .set('Accept', 'application/json')
        .expect(204)
    })

    it('throws a 400 if contract address is missing in the request body', () => {
      return request(app)
        .post('/loadSmartContract')
        .send({ executable: mockModule })
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
      return request(app)
        .post('/unloadSmartContract')
        .send({ contractAddress: 'abcd' })
        .set('Accept', 'application/json')
        .expect(204)
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
      await request(app)
        .post('/loadSmartContract')
        .send({ contractAddress: 'abcd', executable: mockModule })
        .set('Accept', 'application/json')
        .expect(204)

      return request(app)
        .post('/execute/abcd/foobar')
        .send({ number1: 1, number2: 2 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body.data.result).to.eql(3)
        })
    })

    it('throws a 400 if the contract is not yet loaded', () => {
      return request(app)
        .post('/execute/abcd/add')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
  })
})
