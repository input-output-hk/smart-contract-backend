import { Engine } from '../Engine'
import { executeInBrowser } from './execute'
import { BadArgument, ContractNotLoaded } from '../errors'

let contracts: { [contractAddress: string]: string } = {}

const NodeEngine: Engine = {
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
    return executeInBrowser(contractString, method, methodArgs)
  },
  unload: async ({ contractAddress }) => {
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
