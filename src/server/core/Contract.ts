import { Entity } from './lib'
import { Bundle } from '.'

export interface Contract extends Entity {
  address: string
  bundle: Bundle
}
