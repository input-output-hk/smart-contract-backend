import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'

export function getPubSubClient() {
  const { REDIS_DOMAIN, REDIS_PORT } = process.env
  const options = {
    host: REDIS_DOMAIN,
    port: Number(REDIS_PORT),
  }

  return new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  })
}