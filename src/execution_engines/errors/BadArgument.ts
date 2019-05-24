import { CustomError } from 'ts-custom-error'

export class BadArgument extends CustomError {
  public constructor (typeOf: string) {
    super()
    this.message = `The JS Execution method argument must be a string. A ${typeOf} was passed instead.`
  }
}
