import * as fs from 'fs'
const rimraf = require('rimraf')

export function checkFolderExists (path: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (err) return resolve(false)
      if (stats.isDirectory()) return resolve(true)
      return resolve(false)
    })
  })
}

export function createDirectory (path: string) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

export function removeDirectoryWithContents (path: string) {
  return new Promise((resolve, reject) => {
    rimraf(path, (err: Error, _: any) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

export function writeFile (path: string, payload: Buffer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, payload, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

export function readFile (path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}
