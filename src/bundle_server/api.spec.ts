import { expect } from 'chai'
import { configureApi } from './api'
import * as request from 'supertest'
import { Server } from 'http'

describe('bundleServer:api', () => {
  let app: Server

  beforeEach(async () => {
    app = configureApi(`${__dirname}/../../test/bundles`).listen(4100)
  })

  afterEach(async () => {
    app.close()
  })

  describe('/:contractAddress', () => {
    it('throws a 404 if the contract address is not provided', () => {
      return request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(404)
    })

    it('throws a 404 if the contract does not exist on the filesystem', () => {
      return request(app)
        .get('/testContractz')
        .set('Accept', 'application/json')
        .expect(404)
    })

    it('returns a 200 with the contract bundle encoded as base64 when it exists', () => {
      return request(app)
        .get('/testContract')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
          expect(!!response.body).to.eql(true)
        })
    })
  })
})
