import { CustomError } from 'ts-custom-error'

export class InvalidEndpoint extends CustomError {
  public constructor (validEndpoints: string[]) {
    super()
    this.message = `Endpoint does not exist. Options are: ${validEndpoints}`
  }
}
