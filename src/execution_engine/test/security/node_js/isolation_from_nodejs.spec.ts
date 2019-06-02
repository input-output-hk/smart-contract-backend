import { expect } from 'chai'
import NodeEngine from '../../../node_js'
import { ExecutionEngines } from '../../../ExecutionEngine'

describe('Puppeteer Isolation from NodeJS', () => {
  beforeEach(() => {
    process.env.ENGINE = ExecutionEngines.nodejs
  })

  it('has no access to the Node API', async () => {
    const contract1 = `{
      foo: () => {
        const fs = require('fs')
      },
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/require is not defined/)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })

  it('has no access to the Node process globals', async () => {
    const contract1 = `{
      foo: () => process,
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/process is not defined/)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })
})
