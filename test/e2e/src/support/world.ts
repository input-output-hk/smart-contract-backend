import { setWorldConstructor } from 'cucumber'

class CustomWorld {
  public publicKey: string

  setPublicKey(pk: string) {
    this.publicKey = pk
  }
}

setWorldConstructor(CustomWorld)