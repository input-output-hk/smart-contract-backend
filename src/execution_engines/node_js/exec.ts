import * as puppeteer from 'puppeteer'

/**
 * The exec function creates a new chromium instance, navigates to a blank
 * page and executes the passed function and arguments against this blank page
 *
 * As this is an isolated page, there is no content that can be maliciously
 * farmed by untrusted code
 *
 * This pattern is unperformant, as a new chromium instance is booted for each
 * function call. Further analysis needed.
 */
export async function exec (executableFn: Function, fnArgs: number[]) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const executionContext = await page.mainFrame().executionContext()

  const result = await executionContext.evaluate(({ fnText, args }) => {
    /* eslint-disable */
    const fn = new Function(`return (${fnText}).apply(null, arguments)`)
    return fn.call(null, args)
    /* eslint-enable */
  }, { fnText: executableFn.toString(), args: fnArgs })

  await browser.close()
  return result
}
