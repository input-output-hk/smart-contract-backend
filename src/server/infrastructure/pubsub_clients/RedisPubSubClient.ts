import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'
import { PubSubEngine } from 'apollo-server'

export function RedisPubSubClient (options: Redis.RedisOptions): PubSubEngine {
  return new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  })
}
