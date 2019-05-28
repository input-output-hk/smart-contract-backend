import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as puppeteer from 'puppeteer'
import { executeInBrowser, loadPage, unloadPage } from './execute'
import { ExecutionFailure } from '../errors'
use(chaiAsPromised)

describe('executeInBrowser', () => {
  let page: puppeteer.Page

  afterEach(() => unloadPage(page))

  it('executes an arbitrary function against the context of chromium', async () => {
    const fn = ({ a, b }: { a: number, b: number }) => a + b
    const executable = `{endpoint1: ${fn}}`

    page = await loadPage(executable)
    const res = await executeInBrowser(page, 'endpoint1', { a: 1, b: 2 })
    expect(res).to.eql(3)
  })

  it('throws if the function call falls', async () => {
    const fn = () => { throw new Error('failed') }
    const executable = `{endpoint1: ${fn}}`

    page = await loadPage(executable)
    const res = executeInBrowser(page, 'endpoint1', { a: 1, b: 2 })
    return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
  })

  it('throws if the endpoint does not exist on the executable', async () => {
    const fn = ({ a, b }: { a: number, b: number }) => a + b
    const executable = `{endpoint1: ${fn}}`

    page = await loadPage(executable)
    const res = executeInBrowser(page, 'endpoint2', { a: 1, b: 2 })
    return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
  })
})
