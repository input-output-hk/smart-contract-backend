import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'

export function getPubSubClient () {
  const { REDIS_HOST, REDIS_PORT } = process.env
  const options = {
    host: REDIS_HOST,
    port: Number(REDIS_PORT)
  }

  return new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  })
}

export enum PubSubTopics {
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED'
}
