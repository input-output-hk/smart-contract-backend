import { getPubSubClient, PubSubTopics } from '../../../infrastructure/pubsub'
const Web3 = require('web3')

export function requestSignature (
  { transaction, publicKey }: { transaction: any, publicKey: string }
) {
  const pubSubClient = getPubSubClient()
  return pubSubClient.publish(
    `${PubSubTopics.SIGNATURE_REQUIRED}.${publicKey}`,
    { transaction }
  )
}

export function initializeWeb3Instance (web3Provider: string) {
  if (!web3Provider) {
    throw new Error('Web3 provider not supplied. Solidity not executable')
  }

  return new Web3(web3Provider)
}
