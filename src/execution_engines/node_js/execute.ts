import * as puppeteer from 'puppeteer'
import { ExecutionFailure } from '../errors'

let browser: puppeteer.Browser
async function getBrowser () {
  if (!browser) {
    browser = await puppeteer.launch()
  }

  return browser
}

export async function loadPage (executable: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  await page.evaluate(({ executable }) => {
    /* eslint-disable */
    const exec = Function(`"use strict"; return (${executable})`)()
    /* eslint-enable */
    const w: any = window
    w.contract = exec
  }, { executable })
  return page
}

export function unloadPage (page: puppeteer.Page) {
  return page.close()
}

/**
 * The executeInBrowser function executes smart contract endpoints against an isolated
 * page for the contract. As this is an isolated page, there is no content that can be maliciously
 * farmed by untrusted code.
 *
 * An executable should a plain string, with a top level javascript object that contains keys
 * of contract endpoints that map to the associated compile contract functions.
 * This representation means that no untrusted code is ever executed in the context of NodeJS
 *
 * Fn arguments must also be an object
 */
export async function executeInBrowser (page: puppeteer.Page, endpoint: string, fnArgs: any) {
  try {
    const result = await page.evaluate(({ endpoint, args }) => {
      const w: any = window
      const endpointFn = w.contract[endpoint]
      if (!endpointFn) throw new Error('Endpoint does not exist')

      return endpointFn(JSON.parse(args))
    }, { endpoint, args: JSON.stringify(fnArgs) })

    return result
  } catch (e) {
    throw new ExecutionFailure(e.message)
  }
}
