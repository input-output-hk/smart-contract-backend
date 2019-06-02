import { ExecutionEngines, DockerExecutionEngineContext } from './ExecutionEngine'
import { MissingConfig } from './errors'

export interface ExecutionEngineConfig {
  executionEngine: ExecutionEngines
  executionApiPort: number
  nodeEnv?: string,
  containerLowerPortBound?: number
  containerUpperPortBound?: number
  dockerExecutionEngineContext?: DockerExecutionEngineContext
}

export function getConfig () {
  const {
    NODE_ENV,
    EXECUTION_ENGINE,
    EXECUTION_API_PORT,
    CONTAINER_LOWER_PORT_BOUND,
    CONTAINER_UPPER_PORT_BOUND,
    DOCKER_EXECUTION_ENGINE_CONTEXT
  } = process.env

  const config: ExecutionEngineConfig = {
    nodeEnv: NODE_ENV,
    executionEngine: EXECUTION_ENGINE as ExecutionEngines,
    executionApiPort: Number(EXECUTION_API_PORT),
    containerLowerPortBound: Number(CONTAINER_LOWER_PORT_BOUND),
    containerUpperPortBound: Number(CONTAINER_UPPER_PORT_BOUND),
    dockerExecutionEngineContext: DOCKER_EXECUTION_ENGINE_CONTEXT
      ? DOCKER_EXECUTION_ENGINE_CONTEXT as DockerExecutionEngineContext
      : DockerExecutionEngineContext.host
  }

  if (!config.executionEngine) {
    throw new MissingConfig('Execution engine not provided')
  }

  config.executionEngine === ExecutionEngines.docker
    ? checkDockerEngineConfig(config)
    : checkNodeEngineConfig(config)

  return config
}

function checkDockerEngineConfig (config: ExecutionEngineConfig) {
  if (
    !config.executionApiPort ||
    !config.containerLowerPortBound ||
    !config.containerUpperPortBound
  ) {
    throw new MissingConfig('Missing docker environment config')
  }
}

function checkNodeEngineConfig (config: ExecutionEngineConfig) {
  if (!config.executionApiPort) {
    throw new MissingConfig('Missing nodejs environment config')
  }
}
