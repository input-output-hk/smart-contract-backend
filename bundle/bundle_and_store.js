const os = require('os')
const platform = os.platform()
const { exec, execFile } = require('child_process')
const { join } = require('path')
const archiver = require('archiver')
const AWS = require('aws-sdk')
const fs = require('fs-extra')

const S3_BUCKET = 'smart-contract-backend-builds'

function commitHash() {
  return new Promise((resolve, reject) => {
    exec('git rev-parse HEAD', function (err, stdout) {
      if (err) return reject(err)
      resolve(stdout.split(/\r?\n/)[0])
    })
  })
}

function createBundle() {
  return new Promise((resolve, reject) => {
    if (platform === 'win32') {
      execFile(join(process.cwd(), 'bundle', 'windows.bat'), function (err, stdout) {
        if (err) return reject(err)
        resolve(stdout)
      })
    } else {
      execFile(join(process.cwd(), 'bundle', 'unix.sh'), function (err, stdout) {
        if (err) return reject(err)
        resolve(stdout)
      })
    }
  })
}

function createZip(bundlePath, zipPath, exeName, buildDeps) {
  return new Promise((resolve, reject) => {
    let output = fs.createWriteStream(zipPath)
    var archive = archiver('zip')

    output.on('close', resolve)

    archive.on('error', function (err) {
      return reject(err)
    })

    archive.pipe(output)

    archive.file(join(bundlePath, exeName), { name: exeName })

    buildDeps.forEach(dep => {
      archive.directory(join(bundlePath, dep), dep)
    })

    archive.finalize()
  })
}

function determineOsInfo(commitHash) {
  const winBuildPath = join(process.cwd(), 'build', 'Windows')
  const macOSBuildPath = join(process.cwd(), 'build', 'Darwin')
  const linuxBuildPath = join(process.cwd(), 'build', 'Linux')

  switch (platform) {
    case 'win32':
      return { bundlePath: winBuildPath, exeName: 'smart-contract-backend.exe', s3Path: `${commitHash}/Windows.zip` }
    case 'darwin':
      return { bundlePath: macOSBuildPath, exeName: 'smart-contract-backend', s3Path: `${commitHash}/Darwin.zip` }
    case 'linux':
      return { bundlePath: linuxBuildPath, exeName: 'smart-contract-backend', s3Path: `${commitHash}/Linux.zip` }
    default:
      throw new Error('Unsupported platform')
  }
}

async function uploadToS3(s3Path, zipPath) {
  const s3 = new AWS.S3()

  const deleteParams = {
    Bucket: S3_BUCKET,
    Key: s3Path
  }

  await s3.deleteObject(deleteParams).promise()

  const createParams = {
    Body: fs.readFileSync(zipPath),
    Bucket: S3_BUCKET,
    Key: s3Path
  }

  await s3.putObject(createParams).promise()
}

async function validateDependencies(buildOutput, bundlePath) {
  const testExpression = RegExp('path-to-executable*', 'g')
  const pkgDeclaredBuildDeps = buildOutput
    .split('\n')
    .filter(line => testExpression.test(line))
    .map(filteredLine => filteredLine.split('path-to-executable/')[1])

  const validatePaths = await Promise.all(pkgDeclaredBuildDeps.map(dep => {
    return fs.pathExists(join(bundlePath, dep))
  }))

  if (new Set(validatePaths).has(false)) {
    throw new Error(`Missing dependencies. Ensure the build copies ${pkgDeclaredBuildDeps} from appropriate locations`)
  }

  return pkgDeclaredBuildDeps
}

async function main() {
  try {
    const hash = await commitHash()
    console.log(`Creating Build for commit: ${hash}`)
    const buildOutput = await createBundle()

    const { bundlePath, exeName, s3Path } = determineOsInfo(hash)

    // We use the output of the pkg and validate that all
    // of the native addons are included at the expected file
    // location before adding them to the zip
    const buildDeps = await validateDependencies(buildOutput, bundlePath)

    const zipPath = `${bundlePath}.zip`
    console.log(`Creating zip at ${zipPath}`)
    await createZip(bundlePath, zipPath, exeName, buildDeps)

    console.log('Uploading to S3...')
    // await uploadToS3(s3Path, zipPath)
  } catch (e) {
    console.log('An error occurred while creating the bundle')
    console.log(e.message)
    throw e
  }
}

main()
  .then(() => console.log('Bundling complete'))
  .catch(() => process.exit(1))
