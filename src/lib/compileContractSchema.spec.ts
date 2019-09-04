import { expect } from 'chai'
import { compileContractSchema } from './compileContractSchema'
const requireFromString = require('require-from-string')

describe('compileContractSchema', () => {
  it('dynamically compiles an io-ts based schema with webpack', async () => {
    const contractSchema = `
      const addArgs = t.type({
        number1: t.number,
        number2: t.number,
      })

      export const Add = createEndpoint<typeof addArgs, typeof t.number, t.NullC>('Add', addArgs, t.number)
    `

    const schema = await compileContractSchema(contractSchema)
    const { Add } = requireFromString(schema)
    expect(Add.validateArgs({ number1: 1, number2: 2 })).to.eql(true)
  })
})
