import { Entity } from '../../../core/lib'

export interface Repository<T extends Entity> {
  add(entity: T): Promise<void>
  find(id: T['id']): Promise<T | null>
  findAll(): Promise<T[]>
  getLast(): Promise<T | null>
  has(id: T['id']): Promise<boolean>
  remove(id: T['id']): Promise<boolean>
  size(): Promise<number>
  update(entity: T): Promise<void>
}
