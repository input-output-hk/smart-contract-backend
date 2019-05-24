import * as puppeteer from 'puppeteer'
import { ExecutionFailure } from '../errors'

let browser: puppeteer.Browser
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch()
  }

  return browser
}

export async function loadPage() {
  const browser = await getBrowser()
  return browser.newPage()
}

export function unloadPage(page: puppeteer.Page) {
  return page.close()
}

/**
 * The executeInBrowser function executes smart contract endpoints against an isolated
 * page for the contract. As this is an isolated page, there is no content that can be maliciously
 * farmed by untrusted code.
 *
 * An executable should be JSON, with the keys as endpoint names, and the values
 * as a string representation of the function to be executed. This representation
 * means that no untrusted code is ever executed in the context of NodeJS
 *
 * Fn arguments must also be an object
 */
export async function executeInBrowser(page: puppeteer.Page, executable: string, endpoint: string, fnArgs: any) {
  try {
    const result = await page.evaluate((a) => {
      const { executable, endpoint, args } = a
      const methods = JSON.parse(executable)

      const endpointFnAsString = methods[endpoint]
      if (!endpointFnAsString) throw new Error('Endpoint does not exist')

      /* eslint-disable */
      const fn = new Function(`return (${endpointFnAsString}).apply(null, arguments)`)
      return fn.call(null, JSON.parse(args))
      /* eslint-enable */
    }, { executable, endpoint, args: JSON.stringify(fnArgs) })

    return result
  } catch (e) {
    throw new ExecutionFailure(e.message)
  }
}
