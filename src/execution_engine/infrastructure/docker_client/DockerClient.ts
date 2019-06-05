import * as Docker from 'dockerode'
import { Contract } from '../../../core'
import { DockerExecutionEngineContext } from '../execution_engines'

interface Config {
  dockerOptions?: Docker.DockerOptions | { socketPath: '/var/run/docker.sock' },
  executionContext: DockerExecutionEngineContext,
  pipeStdout?: boolean | true
}

export function DockerClient (config: Config) {
  const docker = new Docker(config.dockerOptions)
  const findContainerId = async (contractAddress: Contract['address']): Promise<{ containerId: string }> => {
    const containers = await docker.listContainers()
    const targetContainer = containers.find((container) => container.Names[0] === `/${contractAddress}`)
    if (!targetContainer) return { containerId: '' }
    return { containerId: targetContainer.Id }
  }

  const pullContainer = async (dockerImageRepository: string) => {
    return new Promise((resolve, reject) => {
      docker.pull(dockerImageRepository, (err: Error, stream: any) => {
        if (err) return reject(err)
        const onFinished = (err: Error) => {
          if (err) return reject(err)
          resolve()
        }
        const onProgress = (): undefined => undefined
        docker.modem.followProgress(stream, onFinished, onProgress)
      })
    })
  }

  const createContainer = async ({ contractAddress, dockerImageRepository, hostPort }: { contractAddress: Contract['address'], dockerImageRepository: string, hostPort: number }) => {
    const baseHostConfig = {
      AutoRemove: true,
      PortBindings: { '8080/tcp': [{ 'HostPort': `${hostPort}` }] }
    }
    const targetHostConfig = config.executionContext === DockerExecutionEngineContext.docker
      ? { NetworkMode: 'smart-contract-backend_default', ...baseHostConfig }
      : baseHostConfig
    const containerOpts: any = {
      Image: dockerImageRepository,
      name: contractAddress,
      ExposedPorts: { [`8080/tcp`]: {} },
      HostConfig: targetHostConfig
    }
    const host = config.executionContext === DockerExecutionEngineContext.docker
      ? `http://${contractAddress}:8080`
      : `http://localhost:${hostPort}`
    const container = await docker.createContainer(containerOpts)
    if (config.pipeStdout) {
      container.attach({ stream: true, stdout: true, stderr: true }, function (_, stream) {
        stream.pipe(process.stdout)
      })
    }
    await container.start()
    return { port: hostPort, host }
  }

  return {
    createContainer,
    findContainerId,
    async findContainerPort (contractAddress: Contract['address']): Promise<number> {
      const { containerId } = await findContainerId(contractAddress)
      if (!containerId) return 0
      const container = docker.getContainer(containerId)
      const portInspection = (await container.inspect()).HostConfig.PortBindings
      const portMappings: any = Object.values(portInspection)[0]
      return Number(portMappings[0].HostPort)
    },
    async listContainers () {
      return docker.listContainers()
    },
    async loadContainer ({ dockerImageRepository, contractAddress, hostPort }: { dockerImageRepository: string, contractAddress: Contract['address'], hostPort: number }): Promise<{ port: number, host: string } | null> {
      contractAddress = contractAddress.toLowerCase()
      const containerRunning = (await findContainerId(contractAddress)).containerId
      if (containerRunning) return Promise.resolve(null)
      await pullContainer(dockerImageRepository)
      return createContainer({ contractAddress, dockerImageRepository, hostPort })
    },
    async unloadContainer (contractAddress: Contract['address']) {
      contractAddress = contractAddress.toLowerCase()
      const { containerId } = await findContainerId(contractAddress)
      if (!containerId) return
      // The use of stop vs kill will depend on whether the binary has graceful handling of SIGINT
      return docker.getContainer(containerId).kill()
    }
  }
}
