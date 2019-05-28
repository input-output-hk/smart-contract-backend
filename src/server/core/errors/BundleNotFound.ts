import { CustomError } from 'ts-custom-error'

export class BundleNotFound extends CustomError {
  public constructor (location: string) {
    super()
    this.message = `Bundle not found at ${location}`
  }
}
