import { CustomError } from 'ts-custom-error'

export class ContractNotLoaded extends CustomError {
  public constructor () {
    super()
    this.message = `Contract not loaded`
  }
}
