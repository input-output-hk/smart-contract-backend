import NodeEngine from '../../../node_js'
import { ExecutionEngines } from '../../../ExecutionEngine'

describe('Puppeteer Load Test', () => {
  beforeEach(() => {
    process.env.ENGINE = ExecutionEngines.nodejs
  })

  // Once we have an actual JS based contract, we can update this spec to use
  // it instead
  it('Executing a simple array map 500 times...', async () => {
    const contract1 = `{
      foo: (args) => {
        const targetData = args.data
        const mappedResult = targetData.map(a => a + 1)
        return mappedResult
      },
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const args = {
      data: Array.from(new Array(1000), () => 1)
    }

    let iter = 500
    const hrstart = process.hrtime()

    while (iter > 0) {
      await NodeEngine.execute({ contractAddress: 'contract1', method: 'foo', methodArgs: args })
      iter--
    }

    const hrend = process.hrtime(hrstart)
    console.info('Puppeteer Execution time - 500 calls: %ds %dms', hrend[0], hrend[1] / 1000000)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })
})
