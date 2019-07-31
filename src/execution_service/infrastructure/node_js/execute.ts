import * as puppeteer from 'puppeteer'
import { ExecutionFailure } from '../../errors'
import * as path from 'path'
import { platform } from 'os'
const evaluater = require('../../../../puppeteer_evaluater')

let browser: puppeteer.Browser
async function getBrowser () {
  const pAny: any = process
  const isPkg = typeof pAny.pkg !== 'undefined'
  const plat = platform()
  const windowsReplacement = /^.*?\\node_modules\\puppeteer\\\.local-chromium/
  const unixReplacement = /^.*?\/node_modules\/puppeteer\/\.local-chromium/
  const chromiumExecutablePath = isPkg
    ? puppeteer.executablePath().replace(
      plat === 'win32' ? windowsReplacement : unixReplacement,
      path.join(path.dirname(process.execPath), 'puppeteer')
    )
    : puppeteer.executablePath()

  if (!browser) {
    browser = await puppeteer.launch({ executablePath: chromiumExecutablePath })
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

  await page.evaluate(evaluater.evaluate, { executable })

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
