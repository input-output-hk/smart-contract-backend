import { Engine } from '../Engine'
import requireFromString from 'require-from-string'
import { executeInBrowser } from './execute'

let contracts: {[contractAddress: string]: string} = {}

const NodeEngine: Engine = {
  load: async ({ contractAddress, executable }) => {
    contracts[contractAddress] = executable
    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    const contractString = contracts[contractAddress]
    if (!contractString) throw new Error('Contract not loaded')

    const contractModule = requireFromString(contractString)
    const targetFn = contractModule[method]
    if (!targetFn) throw new Error('Method does not exist')

    return executeInBrowser(targetFn, methodArgs)
  },
  unload: async ({ contractAddress }) => {
    return delete contracts[contractAddress]
  }
}

export default NodeEngine
