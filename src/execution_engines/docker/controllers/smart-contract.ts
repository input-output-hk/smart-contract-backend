import { Post, Route, Body, SuccessResponse, Controller } from 'tsoa'
import axios from 'axios'
import {
  loadContainer,
  unloadContainer,
  findContainerPort,
  findContainerId
} from '../docker-api'

interface LoadSmartContractRequest {
  contractAddress: string
  dockerImageRepository: string
}

interface UnloadSmartContractRequest {
  contractAddress: string
}

type SmartContractResponse = any

@Route('')
export class ContainerController extends Controller {
  @SuccessResponse('204', 'No Content')
  @Post('loadSmartContract')
  public async loadSmartContract(@Body() { contractAddress, dockerImageRepository }: LoadSmartContractRequest): Promise<void> {
    const { CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND } = process.env
    this.setStatus(204)
    await loadContainer({
      contractAddress,
      dockerImageRepository,
      lowerPortBound: Number(CONTAINER_LOWER_PORT_BOUND),
      upperPortBound: Number(CONTAINER_UPPER_PORT_BOUND)
    })
  }

  @SuccessResponse('204', 'No Content')
  @Post('unloadSmartContract')
  public async unloadSmartContract(@Body() { contractAddress }: UnloadSmartContractRequest): Promise<void> {
    this.setStatus(204)
    await unloadContainer(contractAddress)
  }

  @SuccessResponse('201', 'Created')
  @Post('execute/{contractAddress}/{method}')
  public async execute(contractAddress: string, method: string, @Body() methodArguments: any): Promise<{ data: SmartContractResponse } | { error: string }> {
    const { RUNTIME } = process.env
    contractAddress = contractAddress.toLowerCase()

    let contractEndpoint: string
    const containerNotFoundError = { error: 'Container not initialized. Call /loadContainer and try again' }
    if (RUNTIME !== 'docker') {
      const associatedPort = await findContainerPort(contractAddress)
      if (associatedPort === 0) {
        this.setStatus(400)
        return containerNotFoundError
      }

      contractEndpoint = `http://localhost:${associatedPort}`
    } else {
      const { containerId } = await findContainerId(contractAddress)
      if (!containerId) {
        this.setStatus(400)
        return containerNotFoundError
      }

      contractEndpoint = `http://${contractAddress}:8000`
    }

    this.setStatus(201)

    const result = await axios.post(`${contractEndpoint}/${method}`, methodArguments)
    return { data: result.data }
  }
}
