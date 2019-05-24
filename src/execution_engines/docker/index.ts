import { ExecutionEngine } from '../ExecutionEngine'
import { loadContainer, findContainerPort, findContainerId, unloadContainer } from './docker-api'
import axios from 'axios'
import { ContractNotLoaded } from '../errors'

const DockerEngine: ExecutionEngine = {
  load: async ({ contractAddress, executable }) => {
    const { CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND } = process.env

    await loadContainer({
      contractAddress,
      dockerImageRepository: executable,
      lowerPortBound: Number(CONTAINER_LOWER_PORT_BOUND),
      upperPortBound: Number(CONTAINER_UPPER_PORT_BOUND)
    })

    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    const { RUNTIME } = process.env
    let contractEndpoint: string
    if (RUNTIME !== 'docker') {
      const associatedPort = await findContainerPort(contractAddress)
      if (associatedPort === 0) {
        throw new ContractNotLoaded()
      }

      contractEndpoint = `http://localhost:${associatedPort}`
    } else {
      const { containerId } = await findContainerId(contractAddress)
      if (!containerId) {
        throw new ContractNotLoaded()
      }

      contractEndpoint = `http://${contractAddress}:8080`
    }

    let result
    if (method === 'initialise') {
      result = await axios.get(`${contractEndpoint}/${method}`)
    } else {
      result = await axios.post(`${contractEndpoint}/${method}`, methodArgs)
    }

    return { data: result.data }
  },
  unload: async ({ contractAddress }) => {
    await unloadContainer(contractAddress)
    return true
  }
}

export default DockerEngine
