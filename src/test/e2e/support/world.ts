import { setWorldConstructor } from 'cucumber'
import { Client } from '../../../client'

export class World {
  client: ReturnType<typeof Client>
  public receivedTransactions: { [publicKey: string]: string[] } = {}

  constructor () {
    const { APPLICATION_URI, WS_URI } = process.env

    this.client = Client({
      apiUri: APPLICATION_URI,
      subscriptionUri: WS_URI,
      transactionHandler: (transaction: string, publicKey: string) => {
        const ctx = this
        let accessor = ctx.receivedTransactions[publicKey]
        if (accessor) {
          accessor.push(transaction)
        } else {
          ctx.receivedTransactions[publicKey] = [transaction]
        }
      }
    })
  }

  async validateTransactionReceived (publicKey: string, attempts: number): Promise<boolean> {
    const accessor = this.receivedTransactions[publicKey]
    if (!accessor) {
      if (attempts > 3) {
        return false
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return this.validateTransactionReceived(publicKey, ++attempts)
    }

    if (accessor.length) {
      return true
    }
  }
}

setWorldConstructor(World)
