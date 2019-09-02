import { expect } from 'chai'
import { NodeJsExecutionEngine } from '../../../infrastructure'

describe('Puppeteer Page Boundaries', () => {
  describe('State isolation', () => {
    beforeEach(async () => {
      const contract1 = Buffer.from(`{
        foo: () => window.a = 1,
        bar: () => window.a
      }`).toString('base64')

      const contract2 = Buffer.from(`{
        bar: () => window.a
      }`).toString('base64')

      await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })
      await NodeJsExecutionEngine.load({ contractAddress: 'contract2', executable: contract2 })
    })

    afterEach(async () => {
      await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
      await NodeJsExecutionEngine.unload({ contractAddress: 'contract2' })
    })

    it('state set on the window by one contract cannot be read by another', async () => {
      await NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
      const contract1Result = await NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'bar' })
      expect(contract1Result.data).to.eql(1)

      const contract2Result = await NodeJsExecutionEngine.execute({ contractAddress: 'contract2', method: 'bar' })
      expect(contract2Result.data).to.eql(undefined)
    })
  })

  it('Local storage inaccessible', async () => {
    const contract1 = Buffer.from(`{
      foo: () => localStorage.setItem('val', 1)
    }`).toString('base64')

    await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/DOMException/)

    await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
  })

  it('Cookies inaccessible', async () => {
    const contract1 = Buffer.from(`{
      foo: () => document.cookie = "username=John Doe"
    }`).toString('base64')

    await NodeJsExecutionEngine.load({ contractAddress: 'contract1', executable: contract1 })

    const failedAccess = NodeJsExecutionEngine.execute({ contractAddress: 'contract1', method: 'foo' })
    await expect(failedAccess).to.eventually.be.rejectedWith(/DOMException/)

    await NodeJsExecutionEngine.unload({ contractAddress: 'contract1' })
  })
})
