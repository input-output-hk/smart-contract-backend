import { PubSubEngine } from 'apollo-server'
import {
  Contract,
  ContractRepository,
  Engine,
  EngineClient,
  ContractExecutionInstruction,
  Events,
  Endpoint,
  ExecutableType
} from '../../core'
import { ContractNotLoaded } from '../../execution_service/errors'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import { compileContractSchema } from '../../lib'
const requireFromString = require('require-from-string')

type Config = {
  contractRepository: ContractRepository
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function ContractController (config: Config) {
  const {
    contractRepository,
    engineClients,
    pubSubClient
  } = config
  return {
    async load (
      contractAddress: Contract['address'],
      executableInfo: {type: ExecutableType, engine: Engine},
      loadOpts: { filePath: string }
    ): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) {
        const engineClient = engineClients.get(executableInfo.engine)
        const executable = await fs.readFile(loadOpts.filePath)

        await engineClient.loadExecutable({ contractAddress, executable })
        const { schema: uncompiledContractSchema } = await engineClient.call({
          contractAddress,
          method: 'schema'
        })

        const schema = await compileContractSchema(uncompiledContractSchema)

        const hash = crypto.createHash('sha256')
        hash.update(executable)
        contract = {
          id: contractAddress,
          address: contractAddress,
          bundle: {
            executable,
            schema,
            meta: {
              engine: executableInfo.engine,
              executableType: executableInfo.type,
              hash: hash.digest('hex')
            }
          }
        }

        await contractRepository.add(contract)
      }

      return true
    },
    async call (instruction: ContractExecutionInstruction) {
      const contract = await contractRepository.find(instruction.contractAddress)
      if (!contract) {
        throw new ContractNotLoaded()
      }

      const engineClient = engineClients.get(contract.bundle.meta.engine)

      // As this is runtime, we don't know the relevant generics of Endpoint,
      // but we can still leverage the interface
      const endpoint = requireFromString(contract.bundle.schema)[instruction.method] as Endpoint<any, any, any>
      const response = await endpoint.call(
        instruction.methodArguments,
        (_args, _state) => engineClient.call(instruction)
      )

      await pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${instruction.originatorPk}`, { transactionSigningRequest: { transaction: JSON.stringify(response.data) } })
      return response.data
    },
    async unload (contractAddress: Contract['address']): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) return false
      const engineClient = engineClients.get(contract.bundle.meta.engine)
      await engineClient.unloadExecutable(contractAddress)
      return contractRepository.remove(contract.address)
    }
  }
}
