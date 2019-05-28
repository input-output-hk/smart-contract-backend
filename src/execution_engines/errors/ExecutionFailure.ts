import { CustomError } from 'ts-custom-error'

export class ExecutionFailure extends CustomError {
  public constructor (message: string) {
    super()
    this.message = message
  }
}
