import * as puppeteer from 'puppeteer'
import { ExecutionFailure } from '../errors'

let browser: puppeteer.Browser
async function getBrowser () {
  if (!browser) {
    browser = await puppeteer.launch()
  }

  return browser
}

export async function deploy (executable: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  // Disallow all outgoing requests
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    interceptedRequest.abort()
  })

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
    .catch(e => {
      if (e.message.match(/Protocol error: Connection closed/)) {
        return
      }

      throw e
    })
}

export async function executeInBrowser (page: puppeteer.Page, endpoint: string, fnArgs: any) {
  try {
    // Primitive resource consumption protection
    // If endpoint execution takes more than 2 seconds, it is considered
    // an attack so the page is forcibly closed.
    const timer = setTimeout(async () => unloadPage(page), 2000)

    const result = await page.evaluate(({ endpoint, args }) => {
      const w: any = window
      const endpointFn = w.contract[endpoint]
      if (!endpointFn) throw new Error('Endpoint does not exist')

      if (args) {
        return endpointFn(JSON.parse(args))
      } else {
        return endpointFn()
      }
    }, { endpoint, args: JSON.stringify(fnArgs) })

    clearTimeout(timer)

    return result
  } catch (e) {
    throw new ExecutionFailure(e.message)
  }
}
