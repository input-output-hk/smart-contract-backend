import { ExecutionEngine } from '../ExecutionEngine'
import { executeInBrowser, deploy, unloadPage } from './execute'
import { BadArgument, ContractNotLoaded } from '../errors'
import { Page } from 'puppeteer'

let contracts: {
  [contractAddress: string]: Page
} = {}

const NodeEngine: ExecutionEngine = {
  load: async ({ contractAddress, executable }) => {
    const deployment = await deploy(executable)
    contracts[contractAddress] = deployment
    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    if (methodArgs && !(methodArgs instanceof Object)) {
      throw new BadArgument(typeof methodArgs)
    }

    const contract = contracts[contractAddress]
    if (!contract) throw new ContractNotLoaded()
    const data = await executeInBrowser(contract, method, methodArgs)
    return { data }
  },
  unload: async ({ contractAddress }) => {
    const contract = contracts[contractAddress]
    if (!contract) return true
    await unloadPage(contract)
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
