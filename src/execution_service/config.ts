import { ExecutionEngines, PortAllocation } from '../core'
import { InMemoryRepository, PortMapper } from '../lib'
import { DockerClient, DockerEngine, DockerExecutionEngineContext, NodeJsExecutionEngine } from './infrastructure'
import { MissingConfig } from './errors'
import { Config as ExecutionServiceConfig, ExecutionEngine } from './application'

export function getConfig (): ExecutionServiceConfig {
  const {
    executionEngineName,
    apiPort,
    containerLowerPortBound,
    containerUpperPortBound,
    dockerExecutionEngineContext
  } = filterAndTypecastEnvs(process.env)

  if (!apiPort) throw new MissingConfig('EXECUTION_API_PORT env not set')
  let engine: ExecutionEngine
  switch (executionEngineName) {
    case ExecutionEngines.docker :
      if (!containerLowerPortBound || !containerUpperPortBound) {
        throw new MissingConfig('CONTAINER_LOWER_PORT_BOUND or CONTAINER_UPPER_PORT_BOUND env not set')
      }
      const portMapper = PortMapper({
        repository: InMemoryRepository<PortAllocation>(),
        range: {
          lower: containerLowerPortBound,
          upper: containerUpperPortBound
        }
      })
      const dockerClient = DockerClient({
        executionContext: dockerExecutionEngineContext
      })
      engine = DockerEngine({ portMapper, dockerClient, dockerExecutionEngineContext })
      break
    case ExecutionEngines.nodejs :
      engine = NodeJsExecutionEngine
      break
  }
  return {
    apiPort,
    engine
  }
}

function filterAndTypecastEnvs (env: any) {
  const {
    EXECUTION_ENGINE,
    EXECUTION_API_PORT,
    CONTAINER_LOWER_PORT_BOUND,
    CONTAINER_UPPER_PORT_BOUND,
    DOCKER_EXECUTION_ENGINE_CONTEXT
  } = env
  return {
    executionEngineName: EXECUTION_ENGINE as ExecutionEngines,
    apiPort: Number(EXECUTION_API_PORT),
    containerLowerPortBound: Number(CONTAINER_LOWER_PORT_BOUND),
    containerUpperPortBound: Number(CONTAINER_UPPER_PORT_BOUND),
    dockerExecutionEngineContext: DOCKER_EXECUTION_ENGINE_CONTEXT as DockerExecutionEngineContext
  }
}
