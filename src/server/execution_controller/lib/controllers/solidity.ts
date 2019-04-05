import { ContractExecutionInstruction } from '../adapter'
import { ExecutionController } from '.'

export const solidityExecutionController: ExecutionController<any, RawEthereumTransaction, void> = {
  call: callSolidityEngine,
  execute: generateSolidityTransaction,
  submitSignedTransaction: submitSolidityTransaction
}

function submitSolidityTransaction (signedTransaction: string, web3Instance: any) {
  return web3Instance.eth.sendSignedTransaction(signedTransaction)
}

export function getContractReference (abi: string, address: string, web3Instance: any) {
  return web3Instance.eth.Contract(abi, address)
}

function callSolidityEngine (payload: ContractExecutionInstruction, web3Instance: any) {
  const contract = getContractReference(payload.contractCode, payload.contractAddress, web3Instance)

  return payload.methodArguments && payload.methodArguments.length
    ? contract.methods[payload.method](payload.methodArguments).call()
    : contract.methods[payload.method]().call()
}

export interface RawEthereumTransaction {
  to: string
  data: string
  from: string
  gas: number
}

async function generateSolidityTransaction (payload: ContractExecutionInstruction, web3Instance: any): Promise<RawEthereumTransaction> {
  const contract = getContractReference(payload.contractCode, payload.contractAddress, web3Instance)

  const data = payload.methodArguments && payload.methodArguments.length
    ? contract.methods[payload.method](...payload.methodArguments)
    : contract.methods[payload.method]()

  const gas = await data.estimateGas()

  return {
    to: payload.contractAddress,
    data: data.encodeABI(),
    from: payload.originatorPk,
    gas
  }
}
