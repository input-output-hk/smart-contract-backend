import * as fs from 'fs'
const rimraf = require('rimraf')

export function checkFolderExists(path: string): Promise<boolean> {
  return new Promise((res, rej) => {
    fs.stat(path, (err, stats) => {
      if (err) return res(false)
      if (stats.isDirectory()) return res(true)
      return res(false)
    })
  })
}

export function createDirectory(path: string) {
  return new Promise((res, rej) => {
    fs.mkdir(path, (err) => {
      if (err) return rej(err)
      return res()
    })
  })
}

export function removeDirectoryWithContents(path: string) {
  return new Promise((res, rej) => {
    rimraf(path, (err: Error, _: any) => {
      if (err) return rej(err)
      return res()
    })
  })
}

export function writeFile(path: string, payload: Buffer) {
  return new Promise((res, rej) => {
    fs.writeFile(path, payload, (err) => {
      if (err) return rej(err)
      return res()
    })
  })
}