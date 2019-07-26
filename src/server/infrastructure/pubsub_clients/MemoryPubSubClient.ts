import { PubSub } from 'graphql-subscriptions'
import { PubSubEngine } from 'apollo-server'

let memoryClient: PubSubEngine

export function MemoryPubSubClient (): PubSubEngine {
  if (memoryClient) {
    return memoryClient
  }

  return new PubSub()
}
