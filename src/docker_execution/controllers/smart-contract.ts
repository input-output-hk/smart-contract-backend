import { Post, Route, Body, SuccessResponse, Controller } from 'tsoa'
import axios from 'axios'
import {
  loadContainer,
  unloadContainer,
  findContainerPort
} from '../docker-api'

interface LoadSmartContractRequest {
  contractAddress: string
  executable: string
}

interface UnloadSmartContractRequest {
  contractAddress: string
}

interface ExecuteContractRequest {
  contractAddress: string
  method: string
  methodArguments: string[]
}

type SmartContractResponse = any

@Route('')
export class ContainerController extends Controller {
  @SuccessResponse('204', 'No Content')
  @Post('loadSmartContract')
  public async loadSmartContract (@Body() { contractAddress, executable }: LoadSmartContractRequest): Promise<void> {
    const { CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND } = process.env
    this.setStatus(204)
    await loadContainer({
      contractAddress,
      executable,
      lowerPortBound: Number(CONTAINER_LOWER_PORT_BOUND),
      upperPortBound: Number(CONTAINER_UPPER_PORT_BOUND)
    })
  }

  @SuccessResponse('204', 'No Content')
  @Post('unloadSmartContract')
  public async unloadSmartContract (@Body() { contractAddress }: UnloadSmartContractRequest): Promise<void> {
    this.setStatus(204)
    await unloadContainer(contractAddress)
  }

  @SuccessResponse('201', 'Created')
  @Post('execute')
  public async execute (@Body() { contractAddress, method, methodArguments }: ExecuteContractRequest): Promise<{ data: SmartContractResponse } | { error: string }> {
    const associatedPort = await findContainerPort(contractAddress)

    if (associatedPort === 0) {
      this.setStatus(400)
      return { error: 'Container not initialized. Call /loadContainer and try again' }
    }

    this.setStatus(201)

    const result = await axios.post(`http://localhost:${associatedPort}`, {
      method,
      method_arguments: methodArguments
    })

    return { data: result.data }
  }
}
