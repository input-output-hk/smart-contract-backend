import { Post, Route, Body, SuccessResponse, Controller } from 'tsoa'
import DockerEngine from '../docker'
import NodeEngine from '../node_js'
import { LoadContractArgs, ExecutionEngine, UnloadContractArgs, SmartContractResponse, ExecutionEngines } from '../ExecutionEngine'
import { ContractNotLoaded } from '../errors'
import { getConfig, ExecutionEngineConfig } from '../config'

function getEngine (config: ExecutionEngineConfig): ExecutionEngine {
  return config.executionEngine === ExecutionEngines.docker
    ? DockerEngine
    : NodeEngine
}

@Route('')
export class ContainerController extends Controller {
  @SuccessResponse('204', 'No Content')
  @Post('loadSmartContract')
  public async loadSmartContract (@Body() { contractAddress, executable }: LoadContractArgs): Promise<void> {
    const engine = getEngine(getConfig())
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)

    await engine.load({ contractAddress, executable })
  }

  @SuccessResponse('204', 'No Content')
  @Post('unloadSmartContract')
  public async unloadSmartContract (@Body() { contractAddress }: UnloadContractArgs): Promise<void> {
    const engine = getEngine(getConfig())
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)

    await engine.unload({ contractAddress })
  }

  @SuccessResponse('200', 'Ok')
  @Post('execute/{contractAddress}/{method}')
  public async execute (contractAddress: string, method: string, @Body() methodArguments: any): Promise<{ data: SmartContractResponse } | { error: string }> {
    const engine = getEngine(getConfig())
    contractAddress = contractAddress.toLowerCase()

    return engine.execute({ contractAddress, method, methodArgs: methodArguments })
      .catch(e => {
        if (e instanceof ContractNotLoaded) {
          this.setStatus(400)
        } else {
          this.setStatus(500)
        }

        return { error: e.message }
      })
  }
}
