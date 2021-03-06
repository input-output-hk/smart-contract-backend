import * as fs from 'fs-extra'
import { exec } from 'child_process'
const uuidv4 = require('uuid/v4')

// The uncompiled schema relies on the following imports but they are
// not declared from the Plutus generator.

// This function is called when dynamically loading straight off of
// the Plutus contract, or we creating a bundle for distribution
export async function compileContractSchema (uncompiledSchema: string) {
  const absolutePathToSrcLib = `${__dirname}/../../src/lib`
  const tempfileAllocator = uuidv4()
  const tscFileName = `${tempfileAllocator}.ts`
  const outputFileName = `${tempfileAllocator}.js`
  const tempTscFilePath = `${absolutePathToSrcLib}/${tscFileName}`
  const tempOutputFilePath = `${absolutePathToSrcLib}/${outputFileName}`

  try {
    const iotsPrefix = `import * as t from 'io-ts'`
    const createEndpointPrefix = `import { createEndpoint } from '${absolutePathToSrcLib}/createEndpoint'`

    const uncompiledSchemaWithImports = `
      ${iotsPrefix}
      ${createEndpointPrefix}
      ${uncompiledSchema}
    `

    await fs.writeFile(tempTscFilePath, uncompiledSchemaWithImports)
    await tscExecutionHandler(tempTscFilePath, tempOutputFilePath)

    const compiledSchema = (await fs.readFile(tempOutputFilePath)).toString()
    return compiledSchema
  } catch (e) {
    throw e
  } finally {
    await fs.remove(tempTscFilePath)
    await fs.remove(tempOutputFilePath)
  }
}

function tscExecutionHandler (tscFilePath: string, outputFilePath: string) {
  return new Promise(async (resolve, reject) => {
    exec(`npx webpack \
      --entry ${tscFilePath} \
      --output ${outputFilePath} \
      --mode production \
      --output-library-target commonjs
    `, (err, stdout, stderr) => {
      if (err) {
        console.error(stdout)
        reject(new Error('tsc error'))
      }

      if (stderr) {
        console.error(stdout)
        reject(new Error('tsc error'))
      }

      resolve()
    })
  })
}
