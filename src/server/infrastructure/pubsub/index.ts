import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'
import { PubSubEngine } from 'apollo-server'

export function getPubSubClient (host: string, port: number): PubSubEngine {
  const options = { host, port }

  return new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  })
}
