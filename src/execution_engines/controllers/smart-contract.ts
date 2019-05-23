import { Post, Route, Body, SuccessResponse, Controller } from 'tsoa'
import DockerEngine from '../docker'
import NodeEngine from '../node_js'
import { LoadContractIntoEngine, Engine, UnloadContractFromEngine, SmartContractResponse, Engines } from '../Engine'
import { ContractNotLoaded } from '../errors'

function getEngine (): Engine {
  const { ENGINE } = process.env

  return ENGINE === Engines.docker
    ? DockerEngine
    : NodeEngine
}

@Route('')
export class ContainerController extends Controller {
  @SuccessResponse('204', 'No Content')
  @Post('loadSmartContract')
  public async loadSmartContract (@Body() { contractAddress, executable }: LoadContractIntoEngine): Promise<void> {
    const engine = getEngine()
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)

    await engine.load({ contractAddress, executable })
  }

  @SuccessResponse('204', 'No Content')
  @Post('unloadSmartContract')
  public async unloadSmartContract (@Body() { contractAddress }: UnloadContractFromEngine): Promise<void> {
    const engine = getEngine()
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)

    await engine.unload({ contractAddress })
  }

  @SuccessResponse('200', 'Ok')
  @Post('execute/{contractAddress}/{method}')
  public async execute (contractAddress: string, method: string, @Body() methodArguments: any): Promise<{ data: SmartContractResponse } | { error: string }> {
    const engine = getEngine()
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
