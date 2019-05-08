import { CustomError } from 'ts-custom-error'
import { NumberRange } from '../lib'

export class AllPortsAllocated extends CustomError {
  constructor (range: NumberRange) {
    super()
    this.message = `All ports in the range ${rangeString(range)} have all been allocated`
    this.name = 'AllPortsAllocated'
  }
}

function rangeString (range: NumberRange) {
  return `${range.lower.toString()} - ${range.upper.toString()}`
}
