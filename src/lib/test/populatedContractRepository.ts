import { Contract } from '../../core'
import { InMemoryRepository } from '../repositories'
import { testContracts } from '.'

export async function populatedContractRepository () {
  const repository = InMemoryRepository<Contract>()
  const contract = testContracts[0]
  await repository.add(contract)
  return repository
}
