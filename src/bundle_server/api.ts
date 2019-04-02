import * as express from 'express'
import * as fs from 'fs'
const tar = require('tar')

export function configureApi (bundleDir: string) {
  const app = express()

  app.get('/:contractAddress', async (req, res) => {
    try {
      const { contractAddress } = req.params
      const bundleLocation = `${bundleDir}/${contractAddress}`
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

      const tarLocation = `${bundleDir}/${contractAddress}/bundle.tar.gz`
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

  return app
}
