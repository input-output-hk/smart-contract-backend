import { CustomError } from 'ts-custom-error'
import { NumberRange } from '../../lib'

export class AllPortsAllocated extends CustomError {
  public constructor (range: NumberRange) {
    super()
    this.message = `All ports in the range ${rangeString(range)} have been allocated`
  }
}

function rangeString (range: NumberRange) {
  return `${range.lower.toString()} - ${range.upper.toString()}`
}
