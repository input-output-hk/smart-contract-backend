import { expect } from 'chai'
import { NodeJsExecutionEngine } from '../../../infrastructure'

describe('Puppeteer Network Security', () => {
  it('Prevents outgoing HTTP requests for a range of methods', async () => {
    const methods = [
      'GET',
      'POST',
      'HEAD',
      'OPTIONS',
      'DELETE',
      'PUT',
      'PATCH',
      'CONNECT',
      'TRACE'
    ]

    for (const method in methods) {
      await tryXhr(method)
    }
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

  await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

  const methodArgs = { maliciousEndpoint: 'http://google.com', httpMethod }
  const failedRequest = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo', methodArgs })
  await expect(failedRequest).to.eventually.be.rejectedWith(/Evaluation failed: 1/)

  await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
}
