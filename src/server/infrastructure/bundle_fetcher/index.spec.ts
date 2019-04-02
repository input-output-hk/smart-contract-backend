import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { fetchAndWriteBundle, loadBundle } from '.'
import { removeDirectoryWithContents, checkFolderExists } from '../../lib/fs'
use(chaiAsPromised)
const nock = require('nock')
const bundle = 'H4sIAMuqiVwAA+2UTW/bMAyGe/avEHTpBhSFnDguEGC3YscORXsbdlBsOlYmS4Ekpy2G/PdZcpLZTpxclgED+FwEkSLFVx9cGr4un+VLVkLF71f25gowxtIkIX58SGdhZJN27onTZEbiaZJMppPZhE0Ji2dTNrsh7BrFDKmt46YpxfJqBdZpNbKuWVYUZ/K0Wshh/E+odF5LuIf3tTbOki/kV0SI+1jDIxR2HmaE0J9C5XRO6KPO6gqUo3etPYdCKOGEVrZxfw9GsgvqBX5brCBzr23eXcguSVineAV03onsxD55313Xs+Gy9svpcw3mgx5c205GoRyYgmcQKvvR8eTCNLWIzbGnECDzrpK+ml5VX/3ak2LGBJ0X1RdWgpSa9tzbwQ7cLMNdDFUEp7/Bs9tr9VRL6S/kuIqR4EH1+cngcemX5feP4MUZoZb0aM02OjcfntLgsqNTcXtra9kdJZU666igvk24xsD2G1AIUh7iaB8b9jZgtdyAOXye8Eb/JAo3++lz53gMuNoocvumjcxve7WErNH2mv8fnG/7o23vb3Ch/7OYpYf+z1LW9P+EJTH2/3+Bf4bNS14KFT7dWtautuFnUniHrHZ8IeG1bQj0jduq9ZXclt7CF1lOr/pAEQRBEARBEARBEARBEARBEARBEARBEAS5yG9u53GoACgAAA=='
const bundleContractAddress = 'abcd'

describe('bundle management', () => {
  beforeEach(() => {
    nock('http://localhost:22222')
      .get('/')
      .reply(200, bundle)
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

  describe('loadBundle', () => {
    it('returns the expect schema and meta data', async () => {
      const { graphQlSchema, engine } = await loadBundle(bundleContractAddress, 'http://localhost:22222')
      expect(engine).to.eql('plutus')
      expect(Object.keys(graphQlSchema)).to.eql(['typeDefs', 'resolvers'])
    })
  })
})
