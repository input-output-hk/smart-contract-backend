import { expect } from 'chai'

import { initialisePortReferences, portRange } from './contract_servers'

describe('initialisePortReferences', () => {
  it('generates port references correctly within the provided range', () => {
    const portRange = initialisePortReferences(10, 20)
    const uniqValues = [...new Set(Object.values(portRange))]

    expect(Object.keys(portRange).length).to.eql(11)
    expect(uniqValues.length).to.eql(1)
    expect(uniqValues[0]).to.eql(false)
  })
})
