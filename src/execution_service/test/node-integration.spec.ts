import { expect } from 'chai'
import * as request from 'supertest'
import * as http from 'http'
import { ExecutionEngines } from '../../core'
import { getConfig } from '../config'
import { ExecutionService } from '../application'
import { NodeJsExecutionEngine } from '../infrastructure/execution_engines'
import { checkPortIsFree } from '../../lib/test'

describe('Node Execution API Integration', () => {
  let executionService: ReturnType<typeof ExecutionService>
  let app: http.Server
  const mockModule = Buffer.from('{ foobar: (args) => { return {result: args.number1 + args.number2 }} }').toString('base64')
  const mockAddress = 'abcd'

  beforeEach(async () => {
    await checkPortIsFree(4100)
    process.env.EXECUTION_ENGINE = ExecutionEngines.nodejs
    process.env.EXECUTION_API_PORT = '4100'
    executionService = ExecutionService(getConfig())
    app = await executionService.boot()
  })

  afterEach(async () => {
    await executionService.shutdown()
    await NodeJsExecutionEngine.unload({ contractAddress: mockAddress })
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
    it('removes a contract by address', async () => {
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
    it('successfully executes a method against a contract', async () => {
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

    it('throws a 404 if the contract is not yet loaded', () => {
      return request(app)
        .post('/execute/abcd/add')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
    })
  })
})
