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
}

export async function executeInBrowser (page: puppeteer.Page, endpoint: string, fnArgs: any) {
  try {
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

    console.log(result)
    return result
  } catch (e) {
    throw new ExecutionFailure(e.message)
  }
}
