import { configureApi } from './api'

const { BUNDLE_SERVER_PORT, BUNDLE_LOCATION } = process.env
if (!BUNDLE_SERVER_PORT || !BUNDLE_LOCATION) {
  throw new Error('Missing init config')
}

configureApi(BUNDLE_LOCATION).listen(Number(BUNDLE_SERVER_PORT), () => {
  console.log(`Bundle Server listening on port ${BUNDLE_SERVER_PORT}`)
})
