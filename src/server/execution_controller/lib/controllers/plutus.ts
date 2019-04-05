import { ContractExecutionInstruction } from '../adapter'
import { ExecutionController } from '.'
import axios from 'axios'

export const plutusExecutionController: ExecutionController<any, any, any> = {
  call: callPlutusEngine,
  execute: executePlutusEngine,
  submitSignedTransaction: submitPlutusTransaction
}

async function callPlutusEngine () {
  throw new Error('Plutus engine does not yet support state calls')
}

function executePlutusEngine ({ contractAddress, method, methodArguments }: ContractExecutionInstruction, plutusExecutionEndpoint: string) {
  return axios.post(`${plutusExecutionEndpoint}/execute/${contractAddress}/${method}`, methodArguments)
    .then(({ data }) => data)
}

function submitPlutusTransaction (signedTransaction: string, walletApiEndpoint: string) {
  return axios.post(`${walletApiEndpoint}/transaction/submitSignedTransaction`, { transaction: signedTransaction })
    .then(({ data }) => data)
}
