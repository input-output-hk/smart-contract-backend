import axios from 'axios'
import { getExecutableAsBase64 } from '../../infrastructure/bundle_fetcher'

export async function initializeContractEngine (contractAddress: string) {
  const { EXECUTION_SERVICE_URI } = process.env
  const executionEndpoint = `${EXECUTION_SERVICE_URI}/loadSmartContract`
  const executable = await getExecutableAsBase64(contractAddress)

  return axios.post(executionEndpoint, { contractAddress, executable })
}
