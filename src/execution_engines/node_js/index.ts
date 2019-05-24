import { ExecutionEngine } from '../ExecutionEngine'
import { executeInBrowser } from './execute'
import { BadArgument, ContractNotLoaded } from '../errors'

let contracts: { [contractAddress: string]: string } = {}

const NodeEngine: ExecutionEngine = {
  load: async ({ contractAddress, executable }) => {
    contracts[contractAddress] = executable
    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    if (!(methodArgs instanceof Object)) {
      throw new BadArgument(typeof methodArgs)
    }

    const contractString = contracts[contractAddress]
    if (!contractString) throw new ContractNotLoaded()
    const data = await executeInBrowser(contractString, method, methodArgs)
    return { data }
  },
  unload: async ({ contractAddress }) => {
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
