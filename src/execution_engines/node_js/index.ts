import { Engine } from '../Engine'
import { executeInBrowser } from './execute'

let contracts: { [contractAddress: string]: string } = {}

const NodeEngine: Engine = {
  load: async ({ contractAddress, executable }) => {
    contracts[contractAddress] = executable
    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    const contractString = contracts[contractAddress]
    if (!contractString) throw new Error('Contract not loaded')
    return executeInBrowser(contractString, method, methodArgs)
  },
  unload: async ({ contractAddress }) => {
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
