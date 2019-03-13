import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { fetchAndWriteBundle, loadBundle, getBundleInfo, ContractMeta } from '.'
import { removeDirectoryWithContents } from './fs';
const nock = require('nock')

const bundle = 'H4sIALeciFwAA+3T32rCMBQG8F37FFlv3EAkqbVCYXd7AXEPYNRjq6R/lqRTGX33Je0obOB2Mycb3+8iIacnIS39Ui2rbK4W64xyOd6bmwvgnMdRxPw8i6ftzMNu3QqnEyYmURQKEYchZ1xMw1l0w/glLvNZbazU7ipG5nsytizO9Lm27faLc7pXYf38R+TlplY0pmNVamvYA3sdMGZPFT3S1iQsfVZLV+hKbF6TPrUdXkZKlQlbWL0r0tu22LhxOXKDJlOqF9LuiK693Zp83Ht336/9Dlvrgg0PpVab4Xu56U9tBs21P9W/lJP1sT/72/+E7/IveNznXwjh8h/xCfL/K3wAAyrSXUFBwoJK1bY2waitHmldW7lS9OTC758epMm7Z5k0ma/I1XoTIJoAAAAAAAAAAAAAAAAAAAAA1/MGI4n2JwAoAAA='
const bundleContractAddress = 'abcd'

describe('bundle management', () => {
  describe('fetchAndWriteBundle', () => {
    beforeEach(() => {
      nock('http://localhost:22222')
        .get('/')
        .reply(200, { bundle })
    })

    afterEach(async () => {
      nock.cleanAll()
      await removeDirectoryWithContents(`${__dirname}/${bundleContractAddress}`)
    })

    it('throws an error if the bundle isnt available at the specified location', async () => {
      const badLocationError = fetchAndWriteBundle({
        bundlePath: `${__dirname}/${bundleContractAddress}/${bundleContractAddress}.tar.gz`,
        bundleDir: `${__dirname}/${bundleContractAddress}`,
        location: 'http://localhost:22000'
      })

      await expect(badLocationError).to.eventually.be.rejectedWith(/Bundle not available/)
    })

    it('successfully writes the bundle when it exists', async () => {
      await fetchAndWriteBundle({
        bundlePath: `${__dirname}/${bundleContractAddress}/${bundleContractAddress}.tar.gz`,
        bundleDir: `${__dirname}/${bundleContractAddress}`,
        location: 'http://localhost:22222'
      })
    })
  })

  describe('getBundleInfo', () => {

  })

  describe('loadBundle', () => {

  })

  describe('unloadBundle', () => {

  })
})