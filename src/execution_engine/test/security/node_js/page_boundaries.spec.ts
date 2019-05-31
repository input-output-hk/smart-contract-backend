import { expect } from 'chai'
import NodeEngine from '../../../node_js'
import { ExecutionEngines } from '../../../ExecutionEngine'

describe('Puppeteer Page Boundaries', () => {
  beforeEach(() => {
    process.env.ENGINE = ExecutionEngines.nodejs
  })

  describe('State isolation', () => {
    beforeEach(async () => {
      const contract1 = `{
        foo: () => window.a = 1,
        bar: () => window.a
      }`

      const contract2 = `{
        bar: () => window.a
      }`

      await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })
      await NodeEngine.load({ contractAddress: 'contract2', executable: contract2 })
    })

    afterEach(async () => {
      await NodeEngine.unload({ contractAddress: 'contract1' })
      await NodeEngine.unload({ contractAddress: 'contract2' })
    })

    it('state set on the window by one contract cannot be read by another', async () => {
      await NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
      const contract1Result = await NodeEngine.execute({ contractAddress: 'contract1', method: 'bar' })
      expect(contract1Result.data).to.eql(1)

      const contract2Result = await NodeEngine.execute({ contractAddress: 'contract2', method: 'bar' })
      expect(contract2Result.data).to.eql(undefined)
    })
  })

  it('Local storage inaccessible', async () => {
    const contract1 = `{
      foo: () => localStorage.setItem('val', 1)
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/DOMException/)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })

  it('Cookies inaccessible', async () => {
    const contract1 = `{
      foo: () => document.cookie = "username=John Doe"
    }`

    await NodeEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/DOMException/)

    await NodeEngine.unload({ contractAddress: 'contract1' })
  })
})
