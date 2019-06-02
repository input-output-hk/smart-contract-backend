import { Contract, Engine, ExecutableType } from '../../core'
import { InMemoryRepository } from '../infrastructure/repositories'
import { testContracts } from '.'

export async function populatedContractRepository () {
  const repository = InMemoryRepository<Contract>()
  const { address, executable, graphQLSchema: graphQlSchema } = testContracts[0]
  await repository.add({
    id: address,
    address,
    bundle: {
      executable,
      graphQlSchema,
      meta: {
        engine: Engine.stub,
        executableType: ExecutableType.docker,
        hash: '111'
      }
    }
  })
  return repository
}
