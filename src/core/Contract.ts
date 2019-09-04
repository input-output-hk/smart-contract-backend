import { Entity } from '../lib'
import { Bundle, Engine } from '.'

export interface Contract extends Entity {
  address: string
  bundle: Bundle
  engine: Engine
}
