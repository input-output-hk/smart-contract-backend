import * as puppeteer from 'puppeteer'
import { ExecutionFailure } from '../errors'

/**
 * The executeInBrowser function creates a new chromium instance, navigates to a blank
 * page and executes the passed executable endpoint and arguments against this blank page
 *
 * As this is an isolated page, there is no content that can be maliciously
 * farmed by untrusted code
 *
 * This pattern will have low performance, as a new chromium instance is booted for each
 * function call.
 *
 * An executable should be JSON, with the keys as endpoint names, and the values
 * as a string representation of the function to be executed. This representation
 * means that no untrusted code is ever executed in the context of NodeJS
 *
 * Fn arguments must also be an object
 */
export async function executeInBrowser (executable: string, endpoint: string, fnArgs: any) {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

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

    await browser.close()
    return result
  } catch (e) {
    console.log(e)
    throw new ExecutionFailure(e.message)
  }
}
