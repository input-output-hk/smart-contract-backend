import { Before, After } from 'cucumber'
import axios from 'axios'

Before({ timeout: 40000 }, async function () {
  const { APPLICATION_URI, WS_URI } = process.env
  if (!APPLICATION_URI || !WS_URI) throw new Error('Missing environment')

  let health = true
  const healthTimeout = setTimeout(() => {
    health = false
    throw new Error('Could not get healthy connection to platform')
  }, 30000)

  async function healthCheck(): Promise<any> {
    try {
      await axios.get(`${APPLICATION_URI}/.well-known/apollo/server-health`)
      clearTimeout(healthTimeout)
    } catch (e) {
      console.log(e)
      await new Promise(resolve => setTimeout(resolve, 5000))
      if (health) {
        return healthCheck()
      }
    }
  }

  await healthCheck()
})

After(function () {
  this.unsubscribeKey()
})