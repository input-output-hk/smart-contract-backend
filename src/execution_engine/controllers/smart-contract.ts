import { Post, Route, Body, Request, SuccessResponse, Controller } from 'tsoa'
import express from 'express'
import { ExecutionEngine, LoadContractArgs, SmartContractResponse, UnloadContractArgs } from '../application'
import { ContractNotLoaded } from '../errors'

interface ExtendedExpressRequest extends express.Request {
  engine: ExecutionEngine
}

@Route('')
export class ContainerController extends Controller {
  @SuccessResponse('204', 'No Content')
  @Post('loadSmartContract')
  public async loadSmartContract (@Request() request: ExtendedExpressRequest, @Body() { contractAddress, executable }: LoadContractArgs): Promise<void> {
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)
    await request.engine.load({ contractAddress, executable })
  }

  @SuccessResponse('204', 'No Content')
  @Post('unloadSmartContract')
  public async unloadSmartContract (@Request() request: ExtendedExpressRequest, @Body() { contractAddress }: UnloadContractArgs): Promise<void> {
    contractAddress = contractAddress.toLowerCase()
    this.setStatus(204)
    await request.engine.unload({ contractAddress })
  }

  @SuccessResponse('200', 'Ok')
  @Post('execute/{contractAddress}/{method}')
  public async execute (@Request() request: ExtendedExpressRequest, contractAddress: string, method: string, @Body() methodArguments: any): Promise<{ data: SmartContractResponse } | { error: string }> {
    contractAddress = contractAddress.toLowerCase()

    return request.engine.execute({ contractAddress, method, methodArgs: methodArguments })
      .catch(e => {
        if (e instanceof ContractNotLoaded) {
          this.setStatus(404)
        } else {
          this.setStatus(500)
        }

        return { error: e.message }
      })
  }
}
