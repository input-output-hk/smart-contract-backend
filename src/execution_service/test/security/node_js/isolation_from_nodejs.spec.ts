import { expect } from 'chai'
import { NodeJsExecutionEngine } from '../../../infrastructure'

describe('Puppeteer Isolation from NodeJS', () => {
  it('has no access to the Node API', async () => {
    const contract1 = Buffer.from(`{
      foo: () => {
        const fs = require('fs')
      },
    }`).toString('base64')

    await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/require is not defined/)

    await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
  })

  it('has no access to the Node process globals', async () => {
    const contract1 = Buffer.from(`{
      foo: () => process,
    }`).toString('base64')

    await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/process is not defined/)

    await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
  })
})
