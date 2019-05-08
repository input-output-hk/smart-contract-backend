import { Repository } from '../../application/lib/Repository'
import { Entity } from '../../core/lib'
import { UnknownEntity } from '../../core/errors/UnknownEntity'

export function InMemoryRepository<T extends Entity > (): Repository<T> {
  const collection = new Map<T['id'], T>()
  return {
    async add (entity: T) {
      collection.set(entity.id, entity)
    },
    async find (id: T['id']) {
      if (!await this.has(id)) return null
      return collection.get(id)
    },
    async findAll () {
      return [...collection.values()]
    },
    async getLast () {
      if (await this.size() === 0) return null
      return [...collection.values()].pop()
    },
    async has (id: T['id']) {
      return collection.has(id)
    },
    async remove (id: T['id']) {
      if (!await this.has(id)) throw new UnknownEntity(String(id))
      return collection.delete(id)
    },
    async size () {
      return collection.size
    },
    async update (entity: T) {
      await this.remove(entity.id)
      this.add(entity)
    }
  }
}
