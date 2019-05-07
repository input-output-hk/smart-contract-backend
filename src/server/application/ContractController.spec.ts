import { expect } from 'chai'
import axios from 'axios'
import { ContractController } from './ContractController'
import { Contract } from '../core'
import { InMemoryRepository } from '../infrastructure/repositories'
import { HttpTarGzBundleFetcher } from '../infrastructure/bundle_fetcher'
import { ContractRepository } from './lib/ContractRepository'
const nock = require('nock')

describe('Contract Controller', () => {
  let controller: ReturnType<typeof ContractController>
  let repository: ContractRepository
  const bundleLocation = 'http://bundle'
  const networkInterface = axios.create()
  const contractAddress = 'abcd'
  const bundle = 'H4sIALNW0FwAA+1Y3U/jOBDf5/4VVl5oJVTSUsqqEie1VERlWfYoaKXs6YTSxE1cEruyHQS76v9+thNCPprQewCOW/8emmS+PDOZqceJIHe6K0bwp9eDaZrDwQDI6/HwSF3NfvKscCgeeoeDYf/40BwOB8DsHZpm7xMwX9GnDDHjDhWuzINH1iQnxJbLBn4SCsiuHwS/WgAYEPsIQ2MEjHUY85gZ+4r6AN2YO4sQ3jyuFdcj7h2kCTdwWCBp+AHx8Tw4syx3Zp25X6zzgX008V3r1Lyxpr59MUFX1syeWF9t++fcR9OH1cqaEJtPVnNr6tp0/Nmez4Mf1rlpXySmk2VmkePDOVwThjihj3It5kQryDjBByxyKL91CebUcfktg/Qe0ttIKBqtzXvn9CPh+SW/3hov9b/4Byj3f7831P3/Frg8GL+3CxrvCJ866+AqvHYDGMlB4DXWeKH/j4/7w1L/D/pHfd3/b4GIeHEIu/BhTShn4AQsY+xyRDBoJ1uDuD2V2ywJQ0g7QM4LFPKYYnULABezwRQu2Sh9Fvv3HcKe3K6nxI0jiLna1RXHg0uEkbTJhMBfKRlkqgX1b4sVdPlNYj9Vy0wpSexEci7Ja+f0LyV3v8i7d8JYjTJXMRQzRY65KVhGmEO6dFyo/Py7wPMQFX6h+228JYKhV4ytHF/BxzMpXxNefYgvhVkMlfF4YZT4m8pCDvXVy6oGpdg8GQGb/CD4Mg5DNStucafWQCkUr8ZAUy52yYeSyXIyISSEDi6nRWJToZUp1eSVSqLAzms/c3I23r74v4qJTxn8Lerf8bx/Wf4VY41VO8PrmH+XqzUE0hzMLgEVg8JxtIC0t7WAt67d0H87N/HLhnZuZiXamI+KsVo7+bzMxHZTI1Zt7Drq9gw2NXmN1n+1bvq6bhI5XTc71g2hyEfY4YT+eaeLJ5HLknPNKcL+u9VPifK/H97q0/1Gs1t6lyXaCIlbiM2Qh0ouSObzcgZUIfbMz628mdQhChkJ7yHNnaPUESVvVQ7y7U4hhelRjNMYVtzLQn0a9/K2xFDUvt0HYuxhRYuuOJtx8AukA8Z+etMHG3E4lOIVWSR+aJwcGk9KLzj5sjwCe8mH5b1i9iPIA+IJrvCmxHr6tDv2PJEaJmUWblko0R8/jW6jrW4XVfL/YyMVTzdPyg/ErdzDwQG4jhcR4oATkB2MEy/Vybj6TrYcn7sJDZ6mwbVzqesU3OzyAOK2iByc/AHOr79ddpkqerR8lNROp/q2W0+/G/0FXENDQ0NDQ0NDQ0NDQ6OMfwC1m7HRACgAAA=='

  beforeEach(() => {
    repository = InMemoryRepository<Contract>()
    controller = ContractController({
      contractRepository: repository,
      bundleFetcher: HttpTarGzBundleFetcher(networkInterface)
    })

    nock(bundleLocation)
      .get('/')
      .reply(200, bundle)
  })

  afterEach(() => nock.cleanAll())

  describe('load', () => {
    it('fetches and stores the contract bundle in the repository', async () => {
      const result = await controller.load(contractAddress, bundleLocation)
      expect(result).to.be.true
      expect(await repository.has(contractAddress)).to.eq(true)
    })
  })

  describe('unload', () => {
    it('removes the contract from the repository', async () => {
      await controller.load(contractAddress, bundleLocation)
      expect(await repository.has(contractAddress)).to.eq(true)
      const result = await controller.unload(contractAddress)
      expect(result).to.be.true
      expect(await repository.has(contractAddress)).to.eq(false)
    })
  })
})
