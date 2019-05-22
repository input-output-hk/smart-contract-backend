import { Contract, ContractExecutionInstruction, EngineClient } from '../../../core'
import { RawEthereumTransaction } from './RawEthereumTransaction'
const Web3 = require('web3')

type Config = {
  web3: ReturnType<typeof Web3>
}

export function SolidityEngineClient (
  config: Config): EngineClient {
  const { web3 } = config
  const contracts = new Map<Contract['address'], ReturnType<typeof Web3.eth.Contract>>()
  return {
    name: 'solidity',
    async loadExecutable ({ contractAddress, executable }) {
      if (contracts.has(contractAddress)) return
      contracts.set(contractAddress, web3.eth.Contract(executable, contractAddress))
    },
    async unloadExecutable (contractAddress) {
      contracts.delete(contractAddress)
    },
    call ({ contractAddress, method, methodArguments }: ContractExecutionInstruction) {
      const contract = contracts.get(contractAddress)
      return methodArguments && methodArguments.length ?
        contract.methods[method](methodArguments).call() :
        contract.methods[method]().call()
    },
    async execute ({ contractAddress, method, methodArguments, originatorPk }: ContractExecutionInstruction): Promise<RawEthereumTransaction> {
      const contract = contracts.get(contractAddress)
      const data = methodArguments && methodArguments.length ?
        contract.methods[method](methodArguments) :
        contract.methods[method]()
      return {
        to: contractAddress,
        data: data.encodeABI(),
        from: originatorPk,
        gas: await data.estimateGas()
      }
    },
    async submitSignedTransaction (transaction: string) {
      return web3.eth.sendSignedTransaction(transaction)
    }
  }
}
