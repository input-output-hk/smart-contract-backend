import { CustomError } from 'ts-custom-error'

export class ContainerFailedToStart extends CustomError {
  public constructor () {
    super()
    this.message = 'Contract container failed to start'
  }
}
