import { CustomError } from 'ts-custom-error'

export class UnknownEntity extends CustomError {
  public constructor (id: string) {
    super()
    this.message = `Cannot find entity with the ID ${id}`
  }
}
