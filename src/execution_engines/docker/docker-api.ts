import * as Docker from 'dockerode'
const fp = require('find-free-port')

export function initializeDockerClient () {
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

export async function findContainerId (contractAddress: string): Promise<{ containerId: string }> {
  const docker = initializeDockerClient()
  const containers = await docker.listContainers()
  const targetContainer = containers.find((container) => container.Names[0] === `/${contractAddress}`)
  if (!targetContainer) return { containerId: '' }
  return { containerId: targetContainer.Id }
}

export async function findContainerPort (contractAddress: string): Promise<number> {
  const { containerId } = await findContainerId(contractAddress)
  if (!containerId) return 0

  const docker = initializeDockerClient()
  const container = docker.getContainer(containerId)
  const portInspection = (await container.inspect()).HostConfig.PortBindings
  const portMappings: any = Object.values(portInspection)[0]
  return Number(portMappings[0].HostPort)
}

export async function createContainer ({ contractAddress, dockerImageRepository, lowerPortBound, upperPortBound }: { contractAddress: string, dockerImageRepository: string, lowerPortBound: number, upperPortBound: number }) {
  const { RUNTIME } = process.env
  const docker = initializeDockerClient()
  const [freePort] = await fp(lowerPortBound, upperPortBound)
  const baseHostConfig = {
    AutoRemove: true,
    PortBindings: { '8000/tcp': [{ 'HostPort': `${freePort}` }] }
  }

  const targetHostConfig = RUNTIME === 'docker'
    ? { NetworkMode: 'smart-contract-backend_default', ...baseHostConfig }
    : baseHostConfig

  const containerOpts: any = {
    Image: dockerImageRepository,
    name: contractAddress,
    ExposedPorts: { [`8000/tcp`]: {} },
    HostConfig: targetHostConfig
  }

  const container = await docker.createContainer(containerOpts)

  if (process.env.NODE_ENV !== 'test') {
    container.attach({ stream: true, stdout: true, stderr: true }, function (_, stream) {
      stream.pipe(process.stdout)
    })
  }

  await container.start()
  return { port: freePort }
}

export function pullContainer (dockerImageRepository: string) {
  return new Promise((resolve, reject) => {
    const docker = initializeDockerClient()
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

export async function loadContainer ({ dockerImageRepository, contractAddress, lowerPortBound, upperPortBound }: { dockerImageRepository: string, contractAddress: string, lowerPortBound: number, upperPortBound: number }): Promise<{ port: number }> {
  contractAddress = contractAddress.toLowerCase()
  const containerRunning = (await findContainerId(contractAddress)).containerId
  if (containerRunning) return

  await pullContainer(dockerImageRepository)
  return createContainer({ contractAddress, dockerImageRepository, lowerPortBound, upperPortBound })
}

export async function unloadContainer (contractAddress: string) {
  contractAddress = contractAddress.toLowerCase()
  const { containerId } = await findContainerId(contractAddress)
  if (!containerId) return

  const docker = initializeDockerClient()

  // The use of stop vs kill will depend on whether the binary has graceful handling of SIGINT
  return docker.getContainer(containerId).kill()
}
