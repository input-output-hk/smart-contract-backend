import { expect } from 'chai'

import { availablePorts } from '.'

describe('availablePorts', () => {
  describe('initialize', () => {
    it('initialize references correctly within the provided range', () => {
      process.env.LOWER_PORT_BOUND = '10'
      process.env.UPPER_PORT_BOUND = '20'

      availablePorts.initialize()
      const portRange = availablePorts.findAll()
      const uniqValues = [...new Set(Object.values(portRange))]

      expect(Object.keys(portRange).length).to.eql(11)
      expect(uniqValues.length).to.eql(1)
      expect(uniqValues[0]).to.eql(false)
    })
  })
})
