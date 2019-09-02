import { Contract, ContractCallInstruction, EngineClient } from '../../../core'

export function StubEngineClient (): EngineClient {
  return {
    name: 'stub',
    async loadExecutable ({ contractAddress }) {
      return Promise.resolve({ contractAddress, description: '' })
    },
    async unloadExecutable (contractAddress: Contract['address']) {
      return Promise.resolve(contractAddress)
    },
    call ({ contractAddress, method, methodArguments }: ContractCallInstruction) {
      if (method === 'schema') {
        return {
          schema: `
            const addArgs = t.type({
              number1: t.number,
              number2: t.number,
            })

            export const Add = createEndpoint<typeof addArgs, typeof t.number, t.NullC>('Add', addArgs, t.number)
          `
        }
      }

      return { contractAddress, method, methodArguments }
    }
  }
}
