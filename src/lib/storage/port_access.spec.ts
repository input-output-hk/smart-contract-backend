import { expect } from 'chai'
import { availablePorts } from '.'

describe('availablePorts', () => {
  beforeEach(() => {
    process.env.LOWER_PORT_BOUND = '10'
    process.env.UPPER_PORT_BOUND = '20'
    availablePorts.initialize()
  })

  afterEach(() => {
    process.env.LOWER_PORT_BOUND = ''
    process.env.UPPER_PORT_BOUND = ''
  })

  describe('initialize', () => {
    it('initialize references correctly within the provided range', () => {
      const portRange = availablePorts.findAll()
      const uniqValues = [...new Set(Object.values(portRange))]

      expect(Object.keys(portRange).length).to.eql(11)
      expect(uniqValues.length).to.eql(1)
      expect(uniqValues[0]).to.eql(false)
    })
  })

  describe('create', () => {
    it('throws a no-op error', () => {
      expect(() => availablePorts.create(false)).to.throw(/No create operation/)
    })
  })

  describe('find', () => {
    it('finds the value of a port', () => {
      expect(availablePorts.find(15)).to.eql(false)
    })
  })

  describe('update', () => {
    it('correctly updates a ports reference', () => {
      availablePorts.update(15, true)
      expect(availablePorts.find(15)).to.eql(true)
    })
  })

  describe('remove', () => {
    it('throws a no-op error', () => {
      expect(() => availablePorts.remove(1)).to.throw(/No remove operation/)
    })
  })
})
