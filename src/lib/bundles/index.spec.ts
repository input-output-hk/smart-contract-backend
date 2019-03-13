import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { fetchAndWriteBundle, loadBundle, getBundleInfo } from '.'
import { removeDirectoryWithContents, checkFolderExists } from './fs'
use(chaiAsPromised)
const nock = require('nock')
const bundle = 'H4sIAB6kiFwAA+3T3WrCMBQHcK/7FFlv3EAkibVCYXd7AXEPYNSjVdIPknQqo+++tBVhA7ebOdn2/10knJOckJSejVFlOtWzZUqZGu5s7wo453EUsWaexON25rKLW3IsmBhFkRRScikZF2MZT3qMX+MyH1XWKeOvYlW2I+uK/MI+v229/uSc7insPP8SWbGqNA3pUBbGWfbIXgPG3LGkJ1rbhM191MVsWpE5tsuNlLQuEjZzZptv7tpk7cf5wA+GbKFfyPj6bntbmryvvX84x02Fq0zO+vvC6FX/lK7Pp9ZBHdz6Q/1RGbmm7S/+9t/hq/4XPD71v4iFEL7/Iz6K0P8/oenBkPLNNqcwYWGpK1fZcNBmD7SsnFpoevb936zulc26tVTZtMmoxXIVBvWtXwEAAAAAAAAAAAAAAAAAAADwf70BWHGY/wAoAAA='
const bundleContractAddress = 'abcd'

describe('bundle management', () => {
  beforeEach(() => {
    nock('http://localhost:22222')
      .get('/')
      .reply(200, { bundle })
  })

  afterEach(async () => {
    nock.cleanAll()
    await removeDirectoryWithContents(`${__dirname}/${bundleContractAddress}`)
  })

  describe('fetchAndWriteBundle', () => {
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

      const bundleDirExists = await checkFolderExists(`${__dirname}/${bundleContractAddress}`)
      expect(bundleDirExists).to.eql(true)
    })
  })

  describe('getBundleInfo', () => {
    it('returns the correct bundle info', async () => {
      const expectedInfo = {
        bundlePath: `${__dirname}/${bundleContractAddress}/${bundleContractAddress}.tar.gz`,
        bundleDir: `${__dirname}/${bundleContractAddress}`,
        exists: false
      }

      const bundleInfo = await getBundleInfo(bundleContractAddress)
      expect(bundleInfo).to.eql(expectedInfo)
    })
  })

  describe('loadBundle', () => {
    it('returns the expect schema and meta data', async () => {
      const { graphQlSchema, engine } = await loadBundle(bundleContractAddress, 'http://localhost:22222')
      expect(engine).to.eql('plutus')
      expect(Object.keys(graphQlSchema)).to.eql(['typeDefs', 'resolvers'])
    })
  })
})
