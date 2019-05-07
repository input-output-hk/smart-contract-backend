import { CustomError } from 'ts-custom-error'

export class UnknownEntity extends CustomError {
  constructor (id: string) {
    super()
    this.message = `Cannot find entity with the ID ${id}`
    this.name = 'UnknownEntity'
  }
}
