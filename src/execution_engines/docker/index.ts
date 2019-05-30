import { ExecutionEngine, DockerExecutionEngineContext } from '../ExecutionEngine'
import { loadContainer, findContainerPort, findContainerId, unloadContainer } from './docker-api'
import axios from 'axios'
import { ContractNotLoaded, ContainerFailedToStart } from '../errors'
import { getConfig } from '../config'
const ping = require('ping')

const DockerEngine: ExecutionEngine = {
  load: async ({ contractAddress, executable }) => {
    const { containerLowerPortBound, containerUpperPortBound } = getConfig()
    const loadedContainer = await loadContainer({
      contractAddress,
      dockerImageRepository: executable,
      lowerPortBound: containerLowerPortBound,
      upperPortBound: containerUpperPortBound
    })
    if (!loadedContainer) return true
    let alive = false
    let pingCount = 0
    while (!alive) {
      if (pingCount > 10) {
        throw new ContainerFailedToStart()
      }
      alive = await ping.promise.probe(loadedContainer.host)
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return true
  },
  execute: async ({ contractAddress, method, methodArgs }) => {
    const { dockerExecutionEngineContext } = getConfig()
    let contractEndpoint: string
    if (dockerExecutionEngineContext !== DockerExecutionEngineContext.docker) {
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
