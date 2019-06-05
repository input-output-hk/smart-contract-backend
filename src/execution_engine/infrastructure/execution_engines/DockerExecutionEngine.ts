import axios from 'axios'
import { PortMapper } from '../../../lib'
import { ExecutionEngines } from '../../../core'
import { ExecutionEngine } from '../../application'
import { ContainerFailedToStart, ContractNotLoaded } from '../../errors'
import { DockerClient } from '..'

const ping = require('ping')

export enum DockerExecutionEngineContext {
  docker = 'docker',
  host = 'host'
}

interface Config {
  dockerExecutionEngineContext: DockerExecutionEngineContext,
  dockerClient: ReturnType<typeof DockerClient>,
  portMapper: ReturnType<typeof PortMapper>
}

export function DockerEngine (config: Config): ExecutionEngine {
  const { dockerExecutionEngineContext, dockerClient, portMapper } = config
  return {
    name: ExecutionEngines.docker,
    load: async ({ contractAddress, executable }) => {
      const loadedContainer = await dockerClient.loadContainer({
        contractAddress,
        dockerImageRepository: executable,
        hostPort: (await portMapper.getAvailablePort()).portNumber
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
      let contractEndpoint: string
      if (dockerExecutionEngineContext !== DockerExecutionEngineContext.docker) {
        const associatedPort = await dockerClient.findContainerPort(contractAddress)
        if (associatedPort === 0) {
          throw new ContractNotLoaded()
        }

        contractEndpoint = `http://localhost:${associatedPort}`
      } else {
        const { containerId } = await dockerClient.findContainerId(contractAddress)
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
      await dockerClient.unloadContainer(contractAddress)
      return true
    }
  }
}