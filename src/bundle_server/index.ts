import * as express from 'express'
import * as fs from 'fs'
const tar = require('tar')

const { BUNDLE_SERVER_PORT } = process.env
if (!BUNDLE_SERVER_PORT) {
  throw new Error('Missing init config')
}

const app = express()

app.get('/:contractAddress', async (req, res) => {
  try {
    const { contractAddress } = req.params
    if (!contractAddress) {
      return res.status(400).send('Contract address not provided')
    }

    const bundleLocation = `bundles/${contractAddress}`
    const bundleExists = await new Promise((resolve) => {
      fs.stat(bundleLocation, (err, stats) => {
        if (err) return resolve(false)
        if (stats.isDirectory()) return resolve(true)
        return resolve(false)
      })
    })

    if (!bundleExists) {
      return res.status(404).send('Bundle not found')
    }

    const tarLocation = `bundles/${contractAddress}/bundle.tar.gz`
    const tarGzExists = await new Promise((resolve) => {
      fs.stat(`bundles/${contractAddress}/bundle.tar.gz`, (err, stats) => {
        if (err) return resolve(false)
        if (stats.isFile()) return resolve(true)
        return resolve(false)
      })
    })

    if (!tarGzExists) {
      await tar.c(
        {
          gzip: true,
          file: tarLocation,
          cwd: bundleLocation
        },
        ['meta.json', 'graphQlSchema.js', 'executable']
      )
    }

    const file: Buffer = await new Promise((resolve, reject) => {
      fs.readFile(tarLocation, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })

    res.status(200).send(file.toString('base64'))
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Failed to serve bundle' })
  }
})

app.listen(Number(BUNDLE_SERVER_PORT), () => {
  console.log(`Bundle Server listening on port ${BUNDLE_SERVER_PORT}`)
})
