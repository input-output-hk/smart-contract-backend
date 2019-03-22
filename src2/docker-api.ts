import * as Docker from 'dockerode'
import { writeFile, unlink } from 'fs'
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

export async function buildImage (dockerfileRelativePath: string, imageName: string) {
  const docker = initializeDockerClient()

  const buildOpts: any = {
    context: `${__dirname}/..`,
    src: ['docker']
  }

  let stream = await docker.buildImage(buildOpts, { t: imageName, dockerfile: dockerfileRelativePath })

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err: any, res: any) => err ? reject(err) : resolve(res))
  })
}

export function writeExecutable (executable: string, executablePath: string) {
  const executableData = Buffer.from(executable, 'base64')

  return new Promise((resolve, reject) => {
    writeFile(executablePath, executableData, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export function removeExecutable (executablePath: string) {
  return new Promise((resolve, reject) => {
    unlink(executablePath, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export function writeDockerfile (executablePath: string) {
  const dockerfile = `
    FROM ubuntu:18.04
    RUN ["mkdir", "/plutus"]
    COPY ${executablePath} /plutus/executable
    RUN chmod +x /plutus/executable
    CMD /plutus/executable
  `

  return new Promise((resolve, reject) => {
    writeFile(`${executablePath}-Dockerfile`, dockerfile, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export async function createContainer ({ contractAddress, lowerPortBound, upperPortBound }: { contractAddress: string, lowerPortBound: number, upperPortBound: number }) {
  const docker = initializeDockerClient()
  const [freePort] = await fp(lowerPortBound, upperPortBound)
  const containerOpts: any = {
    Image: `i-${contractAddress}`,
    name: contractAddress,
    ExposedPorts: { [`8000/tcp`]: {} },
    HostConfig: {
      AutoRemove: true,
      PortBindings: { '8000/tcp': [{ 'HostPort': `${freePort}` }] }
    }
  }

  const container = await docker.createContainer(containerOpts)
  await container.start()
  return { port: freePort }
}

export async function loadContainer ({ executable, contractAddress, lowerPortBound, upperPortBound }: { executable: string, contractAddress: string, lowerPortBound: number, upperPortBound: number }): Promise<{ port: number }> {
  const containerRunning = (await findContainerId(contractAddress)).containerId
  if (containerRunning) return

  const relativeExecutablePath = `docker/${contractAddress}`
  const relativeDockerfilePath = `${relativeExecutablePath}-Dockerfile`

  await writeExecutable(executable, relativeExecutablePath)
  await writeDockerfile(relativeExecutablePath)
  await buildImage(relativeDockerfilePath, `i-${contractAddress}`)
  await removeExecutable(relativeExecutablePath)
  return createContainer({ contractAddress, lowerPortBound, upperPortBound })
}

export async function unloadContainer (contractAddress: string) {
  const { containerId } = await findContainerId(contractAddress)
  if (!containerId) return

  const docker = initializeDockerClient()

  // The use of stop vs kill will depend on whether the binary has graceful handling of SIGINT
  return docker.getContainer(containerId).kill()
}
