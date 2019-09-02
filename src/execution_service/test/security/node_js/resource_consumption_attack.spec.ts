import { expect } from 'chai'
import { NodeJsExecutionEngine } from '../../../infrastructure'
import { ExecutionFailure } from '../../../errors'

describe('Puppeteer resource consumption protection', () => {
  it('aborts execution if it takes more than 2s', async () => {
    const contract1 = Buffer.from(`{
      foo: () => {
        while (true) { }
      },
    }`).toString('base64')

    await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const t1 = Date.now()
    const whileTrueCall = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(whileTrueCall).to.eventually.be.rejectedWith(ExecutionFailure)

    const t2 = Date.now()
    expect(t2 - t1 > 2000).to.eql(true)

    const secondCallToInstantlyFail = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(secondCallToInstantlyFail).to.eventually.be.rejectedWith(ExecutionFailure)

    const t3 = Date.now()
    expect(t3 - t2 < 2000).to.eql(true)

    await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
  })
})
