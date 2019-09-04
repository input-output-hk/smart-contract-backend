import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { ExecutionService } from '.'
import { StubExecutionEngine } from '../infrastructure'
import { checkPortIsFree } from '../../lib/test'

use(chaiAsPromised)

describe('ExecutionService', () => {
  let executionService: ReturnType<typeof ExecutionService>
  const API_PORT = 9999
  const API_URI = `http://localhost:${API_PORT}`

  beforeEach(async () => {
    await checkPortIsFree(9999)
    executionService = ExecutionService({
      apiPort: API_PORT,
      engine: StubExecutionEngine()
    })
  })

  describe('Boot', () => {
    beforeEach(async () => executionService.boot())
    afterEach(async () => executionService.shutdown())

    it('Starts the API server', async () => {
      expect((await axios.get(`${API_URI}/docs`)).statusText).to.equal('OK')
    })
  })

  describe('Shutdown', () => {
    beforeEach(async () => {
      await executionService.boot()
    })

    it('Closes the API server', async () => {
      await executionService.shutdown()
      await expect(axios.get(`${API_URI}/docs`)).to.be.rejected
    })
  })
})
