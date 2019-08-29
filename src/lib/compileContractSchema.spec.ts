import { expect } from 'chai'
import { compileContractSchema } from './compileContractSchema';

describe.only('compileContractSchema', () => {
  it('dynamically compiles with tsc', async () => {
    const contract = `
      const addArgs = t.type({
        number1: t.number,
        number2: t.number,
      })

      export const Add = createEndpoint<typeof addArgs, typeof t.number, t.NullC>('Add', addArgs, t.number)
    `

    await compileContractSchema(contract)
    expect(1).to.eql(2)
  })
})