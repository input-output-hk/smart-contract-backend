import { PortAllocation } from '../core'
import { NumberRange } from '../core/lib'
import { AllPortsAllocated } from '../core/errors'
import { PortAllocationRepository } from './lib/PortAllocationRepository'

export type Config ={
  repository: PortAllocationRepository
  range: NumberRange
}

export function PortManager ({ repository, range }: Config) {
  const startingPoolQty = range.upper - (range.lower - 1)
  return {
    isAvailable: async (port: number): Promise<boolean> => {
      return !(await repository.has(port.toString()))
    },
    getAvailablePort: async (): Promise<PortAllocation> => {
      const size = await repository.size()
      if (size === startingPoolQty) throw new AllPortsAllocated(range)
      let nextPortNumber
      if (size === 0) {
        nextPortNumber = range.lower
      } else {
        const last = await repository.getLast()
        nextPortNumber = last.portNumber + 1
      }
      const portAllocation = {
        id: nextPortNumber.toString(),
        portNumber: nextPortNumber
      }
      await repository.add(portAllocation)
      return portAllocation
    },
    releasePort: async (port: number): Promise<boolean> => {
      if (await !repository.has(port.toString())) return true
      return repository.remove(port.toString())
    }
  }
}
