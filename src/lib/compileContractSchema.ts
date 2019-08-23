const uuidv4 = require('uuid/v4')
import * as fs from 'fs-extra'
import { exec } from 'child_process'

// The uncompiled schema relies the following imports but they are
// not declared from the Plutus generator.

// This function is called when dynamically loading straight off of
// the Plutus contract, or we creating a bundle for distribution
export async function compileContractSchema(uncompiledSchema: string) {
  const tempfileAllocator = uuidv4() 

  const tscFileName = `${tempfileAllocator}.ts`
  const outputFileName = `${tempfileAllocator}.js`
  const tempTscFilePath = `${__dirname}/${tscFileName}`
  const tempOutputFilePath = `${__dirname}/${outputFileName}`

  const iotsPrefix = `import * as t from 'io-ts'`
  const createEndpointPrefix = `import { createEndpoint } from ${__dirname}/createEndpoint`
  
  const uncompiledSchemaWithImports = `
    ${iotsPrefix}
    ${createEndpointPrefix}
    ${uncompiledSchema}
  `

  await fs.writeFile(tempTscFilePath, uncompiledSchemaWithImports)
  await exec(`npx tsc ${tempTscFilePath} --out ${tempOutputFilePath}`)

  const compiledSchema = (await fs.readFile(tempOutputFilePath)).toString()

  await fs.remove(tempTscFilePath)
  await fs.remove(tempOutputFilePath)

  return compiledSchema
}