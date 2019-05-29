import { expect } from 'chai'
import NodeEngine from '../../../node_js'
import { ExecutionEngines } from '../../../ExecutionEngine'
import { ExecutionFailure } from '../../../errors'

describe('Puppeteer resource consumption protection', () => {
  beforeEach(() => {
    process.env.ENGINE = ExecutionEngines.nodejs
  })

  it('aborts execution if it takes more than 2s', async () => {
    const contract1 = `{
      foo: () => {
        while (true) { }
      },
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const t1 = Date.now()
    const whileTrueCall = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(whileTrueCall).to.eventually.be.rejectedWith(ExecutionFailure)

    const t2 = Date.now()
    expect(t2 - t1 > 2000).to.eql(true)

    const secondCallToInstantlyFail = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(secondCallToInstantlyFail).to.eventually.be.rejectedWith(ExecutionFailure)

    const t3 = Date.now()
    expect(t3 - t2 < 2000).to.eql(true)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })
})
