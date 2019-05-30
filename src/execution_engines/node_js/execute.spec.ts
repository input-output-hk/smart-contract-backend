import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as puppeteer from 'puppeteer'
import { executeInBrowser } from './execute'
import { ExecutionFailure } from '../errors'
use(chaiAsPromised)

describe('executeInBrowser', () => {
  let browser: puppeteer.Browser
  let page: puppeteer.Page

  beforeEach(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
  })

  afterEach(() => browser.close())

  it('executes an arbitrary function against the context of chromium', async () => {
    const fn = ({ a, b }: { a: number, b: number }) => a + b
    const executable = { endpoint1: fn.toString() }
    const res = await executeInBrowser(page, JSON.stringify(executable), 'endpoint1', { a: 1, b: 2 })
    expect(res).to.eql(3)
  })

  it('throws if the function call falls', () => {
    const fn = () => { throw new Error('failed') }
    const executable = { endpoint1: fn.toString() }
    const res = executeInBrowser(page, JSON.stringify(executable), 'endpoint1', { a: 1, b: 2 })
    return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
  })

  it('throws if the endpoint does not exist on the executable', () => {
    const fn = ({ a, b }: { a: number, b: number }) => a + b
    const executable = { endpoint1: fn.toString() }
    const res = executeInBrowser(page, JSON.stringify(executable), 'endpoint2', { a: 1, b: 2 })
    return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
  })
})
