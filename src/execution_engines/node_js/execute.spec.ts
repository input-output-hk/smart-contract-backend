import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { executeInBrowser } from './execute'
use(chaiAsPromised)

describe('executeInBrowser', () => {
  it('executes an arbitrary function against the context of chromium', async () => {
    const fn = (a: number, b: number) => a + b
    const executable = { endpoint1: fn.toString() }
    const res = await executeInBrowser(JSON.stringify(executable), 'endpoint1', 1, 2)
    expect(res).to.eql(3)
  })

  it('throws if the function call falls', () => {
    const fn = () => { throw new Error('failed') }
    const executable = { endpoint1: fn.toString() }
    const res = executeInBrowser(JSON.stringify(executable), 'endpoint1', 1, 2)
    return expect(res).to.eventually.be.rejectedWith(Error)
  })

  it('throws if the endpoint does not exist on the executable', () => {
    const fn = (a: number, b: number) => a + b
    const executable = { endpoint1: fn.toString() }
    const res = executeInBrowser(JSON.stringify(executable), 'endpoint2', 1, 2)
    return expect(res).to.eventually.be.rejectedWith(Error)
  })
})
