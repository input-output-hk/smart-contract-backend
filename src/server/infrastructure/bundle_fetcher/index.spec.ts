import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { fetchAndWriteBundle, loadBundle } from '.'
import { removeDirectoryWithContents, checkFolderExists } from '../../lib/fs'
use(chaiAsPromised)
const nock = require('nock')
const bundle = 'H4sIAAAAAAAAA+0YXW/bNrDP/hWEXpoAQSL5szDQBztGBHdttjjBAG0YAlmibToSaVBkkLbwfx8/ZIWSLMVD4KbbdA8SdV+8O92RPMaQ+efrhOB3xwPbtvvdLhBvZ9Cz5dt29LeCTluMnU63Zw8Gg37bfmc7HafnCPoRbcqAJ8ynwpTX6tG+gOz9E4AZU3NswvcWABbES4ShNQTWJuKMJ9aZwj7BgDN/HsG7rxtFDUnwAKmmrvxkJXH4CbHRbHXlusHUvQp+cT91vd54GbiX9p07WXqfx+jGnXpj94vnfZst0eRpvXbHxGPj9cydBB4dffBms9Uf7ifb+6xV62mmsb+EM7ghCWKEfpVzJX68hgkj+CKJfcruA4IZ9QN2n0D6COl9LASt1vaNwv2vhCX1N6ub6DZYwVguBMeYo77+B/2uo+vfsXt2x3FE/Xc7vXZT/6+FYv3v4mtCTEIewXP4tCGUJeAjWHAcMEQwONH1L4aXssxIFEF6CuR6QSHjFKshAEysDRO4SIbpt6jfB4RDWa4TEvAYYqaqWlFCuEAYSZ2JYPgzRYNMNCf+63wNA3an9adimSrFif1YrkumtCF/LalnedqjH3G1lN1wKNYUg7jNaUaYQbrwA6js/CtHCxEVdqHHfbQFglGY963oX87GK8lf4V61iy+5mXc1YXxuFejb0kQ+XaqfVXZKkZneAursIPiaR5HaK/aYU6mg4EpYoaAuFofEQ/FkMRkTEkEfF8MiYVvCFTHl4BVSIkc2pZ8pho4fn/xfxLauFP4v8t8Pw3+Y/iVltVk7xRvOfpez1ThS78whDuWdwjyeQ+rsTeC9c9fU38FF/LKig4tZsdbGo6SsUo8Zl6nYbirYyoVdhd0fwboir5D6WfOm3eSN5mvy5sC8IRSJHtEXndhvD03yaL4sOLeMIrx8s/wpYP7zh7fqcP+gs1s6ygJtRSTI+WbJppIJlP08nQWVi479oWWqSQ2iMCHRI6RGH6VaFFOrPMifnOZCmLZijHJYMi9zdXfcM3WJQ9HJ/RkQx54krzEQvRkD30F6wDhLB22wFc2hZC/xIvGgXDeNHws/WN8sDcF7fbH0Ph/9GLIVCQVVWFMg7a52RmEoQpNInnlQZNLyo93RbbjX7LyIuY4NlT/nJso8ELeMj4sLcMvnMWKAEZA1xtpK1RkbvHv65nONg5epVydGzE7LP661e26Pfpn1fMl3vDleuP+17U7p/rfT7zf3P6+FQ+5/ry9Gb2RdAw000EADbwl/A9k5DewAHgAA'
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
      expect(Object.keys(graphQlSchema())).to.eql(['typeDefs', 'resolvers'])
    })
  })
})
