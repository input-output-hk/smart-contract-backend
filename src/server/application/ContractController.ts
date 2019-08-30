import { PubSubEngine } from 'apollo-server'
import {
  Contract,
  ContractRepository,
  Engine,
  EngineClient,
  ContractCallInstruction,
  Events,
  Endpoint
} from '../../core'
import { ContractNotLoaded } from '../../execution_service/errors'
import * as fs from 'fs-extra'
import { compileContractSchema } from '../../lib'
import { join } from 'path'
const requireFromString = require('require-from-string')

type Config = {
  contractDirectory: string
  contractRepository: ContractRepository
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function ContractController (config: Config) {
  const {
    contractDirectory,
    contractRepository,
    engineClients,
    pubSubClient
  } = config

  async function loadContract (contractAddress: Contract['address'], engine = Engine.plutus): Promise<boolean> {
    let contract = await contractRepository.find(contractAddress)
    if (!contract) {
      const engineClient = engineClients.get(engine)
      const executable = await fs.readFile(join(contractDirectory, contractAddress))
      await engineClient.loadExecutable({ contractAddress, executable })

      const { schema: uncompiledContractSchema } = await engineClient.call({
        contractAddress,
        method: 'schema'
      })

      const schema = await compileContractSchema(uncompiledContractSchema)

      contract = {
        id: contractAddress,
        address: contractAddress,
        engine,
        bundle: {
          executable,
          schema
        }
      }

      await contractRepository.add(contract)
    }

    return true
  }

  return {
    async loadAll () {
      const contracts = await fs.readdir(contractDirectory)
      return Promise.all(contracts.map(c => loadContract(c)))
    },
    load: loadContract,
    async call (instruction: ContractCallInstruction) {
      const contract = await contractRepository.find(instruction.contractAddress)
      if (!contract) {
        throw new ContractNotLoaded()
      }

      const engineClient = engineClients.get(contract.engine)

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
      const engineClient = engineClients.get(contract.engine)
      await engineClient.unloadExecutable(contractAddress)
      return contractRepository.remove(contract.address)
    }
  }
}
