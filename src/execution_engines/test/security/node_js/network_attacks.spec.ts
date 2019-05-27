import { expect } from 'chai'
import NodeEngine from '../../../node_js'
import { ExecutionEngines } from '../../../ExecutionEngine'

describe('Puppeteer Network Security', () => {
  beforeEach(() => {
    process.env.ENGINE = ExecutionEngines.nodejs
  })

  describe('GET', () => {
    it('Outgoing GET requests to a remote origin are aborted', async () => {
      return tryXhr('GET')
    })
  })

  describe('POST', () => {
    it('Outgoing POST requests to a remote origin are aborted', async () => {
      return tryXhr('POST')
    })
  })

  describe('PUT', () => {
    it('Outgoing PUT requests to a remote origin are aborted', async () => {
      return tryXhr('PUT')
    })
  })

  describe('OPTIONS', () => {
    it('Outgoing OPTIONS requests to a remote origin are aborted', async () => {
      return tryXhr('OPTIONS')
    })
  })

  describe('PATCH', () => {
    it('Outgoing PATCH requests to a remote origin are aborted', async () => {
      return tryXhr('PATCH')
    })
  })

  describe('DELETE', () => {
    it('Outgoing DELETE requests to a remote origin are aborted', async () => {
      return tryXhr('DELETE')
    })
  })
})

async function tryXhr (httpMethod: string) {
  const contract1 = `{
    foo: async (args) => {
      return new Promise((resolve, reject) => {
        const maliciousEndpoint = args.maliciousEndpoint
        const httpMethod = args.httpMethod
        const httpRequest = new XMLHttpRequest()

        httpRequest.onreadystatechange = function () {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            resolve()
          } else {
            reject(httpRequest.readyState)
          }
        }

        httpRequest.open(httpMethod, maliciousEndpoint, true)
        httpRequest.send()
      })
    },
  }`

  await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

  const methodArgs = { maliciousEndpoint: 'http://google.com', httpMethod }
  const failedAccess = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo', methodArgs })
  await expect(failedAccess).to.eventually.be.rejectedWith(/Evaluation failed: 1/)

  await NodeEngine.unload({ contractAddress: 'contract1' })
}
