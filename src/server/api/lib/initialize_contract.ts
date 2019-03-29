import axios from 'axios'
import { getImageRepository } from '../../infrastructure/bundle_fetcher'

export async function initializeContractEngine(contractAddress: string) {
  const { EXECUTION_SERVICE_URI } = process.env
  const executionEndpoint = `${EXECUTION_SERVICE_URI}/loadSmartContract`
  const dockerImageRepository = await getImageRepository(contractAddress)

  return axios.post(executionEndpoint, { contractAddress, dockerImageRepository })
}
