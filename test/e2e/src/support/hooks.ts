import { Before, After } from 'cucumber'
import { World } from '../support/world'
import axios from 'axios'
import * as Docker from 'dockerode'

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

After(async function () {
  const world = this as World
  world.unsubscribeFromPublicKey()

  // This will be removed once unloading is implemented 
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })
  const containers = await docker.listContainers()
  const targetContainers = containers.filter((container) => container.Image.match(/samjeston/g) || container.Image.match(/jann/g))
  await Promise.all(targetContainers.map(c => docker.getContainer(c.Id).kill()))
})