import { ExecutionEngine } from '../ExecutionEngine'
import { executeInBrowser, loadPage, unloadPage } from './execute'
import { BadArgument, ContractNotLoaded } from '../errors'
import { Page } from 'puppeteer'

let contracts: {
  [contractAddress: string]: {
    executable: string
    page: Page
  }
} = {}

const NodeEngine: ExecutionEngine = {
  load: async ({ contractAddress, executable }) => {
    const contractPage = await loadPage()
    contracts[contractAddress] = { executable, page: contractPage }
    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    if (!(methodArgs instanceof Object)) {
      throw new BadArgument(typeof methodArgs)
    }

    const contract = contracts[contractAddress]
    if (!contract) throw new ContractNotLoaded()
    const data = await executeInBrowser(contract.page, contract.executable, method, methodArgs)
    return { data }
  },
  unload: async ({ contractAddress }) => {
    const contract = contracts[contractAddress]
    if (!contract) return true
    await unloadPage(contract.page)
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
