import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { InMemoryRepository } from './InMemoryRepository'
import { Entity } from '../../core/lib'
import { UnknownEntity } from '../../core/errors/UnknownEntity'
use(chaiAsPromised)

type SomeEntity = Entity & {
  name: string
}

const someEntity1 = {
  id: 'someEntity1',
  name: 'some entity 1'
}

const someEntity2 = {
  id: 'someEntity2',
  name: 'some entity 2'
}

describe('In-memory repository', () => {
  let repository: ReturnType<typeof InMemoryRepository>
  beforeEach(() => {
    repository = InMemoryRepository<SomeEntity>()
  })
  describe('Initialization', () => {
    it('Is empty by default', async () => {
      expect(await repository.size()).to.eq(0)
    })
  })
  describe('add', () => {
    it('adds the entity if not already in the collection', async () => {
      expect(await repository.size()).to.eq(0)
      await repository.add(someEntity1)
      expect(await repository.size()).to.eq(1)
      await repository.add(someEntity1)
      expect(await repository.size()).to.eq(1)
    })
  })
  describe('find', () => {
    beforeEach(async () => {
      await repository.add(someEntity1)
    })
    it('returns the entity by ID', async () => {
      expect(await repository.find(someEntity1.id)).to.eq(someEntity1)
    })
    it('returns null if the entity is not in the repository', async () => {
      expect(await repository.find('someUnknownEntityId')).to.eq(null)
    })
  })
  describe('findAll', () => {
    it('returns an array of all the entities', async () => {
      await repository.add(someEntity1)
      await repository.add(someEntity2)
      expect(await repository.findAll()).to.have.members([someEntity1, someEntity2])
    })
    it('returns an empty array if the repository is empty', async () => {
      expect(await repository.size()).to.eq(0)
      expect(await repository.findAll()).to.be.an('array').that.is.empty
    })
  })
  describe('getLast', () => {
    it('returns the last added entity if the repository it not empty', async () => {
      await repository.add(someEntity1)
      await repository.add(someEntity2)
      expect(await repository.getLast()).to.eq(someEntity2)
    })
    it('returns null if the repository is empty', async () => {
      expect(await repository.getLast()).to.eq(null)
    })
  })
  describe('has', () => {
    it('knows if the repository includes an entity by ID', async () => {
      await repository.add(someEntity1)
      expect(await repository.has(someEntity1.id)).to.eq(true)
      expect(await repository.has('someUnknownEntityId')).to.eq(false)
    })
  })
  describe('remove', () => {
    it('removes entity from the repository if it exists', async () => {
      await repository.add(someEntity1)
      expect(await repository.has('someEntity1')).to.eq(true)
      await repository.remove(someEntity1.id)
      expect(await repository.has('someUnknownEntityId')).to.eq(false)
    })
    it('throws an error if the entity does not exist', async () => {
      expect(await repository.has(someEntity1.id)).to.eq(false)
      await expect(repository.remove(someEntity1.id)).to.be.rejectedWith(UnknownEntity)
    })
  })
  describe('size', () => {
    it('reports the total number of entities in the repository', async () => {
      expect(await repository.size()).to.eq(0)
      await repository.add(someEntity1)
      await repository.add(someEntity2)
      expect(await repository.size()).to.eq(2)
      await repository.remove(someEntity1.id)
      expect(await repository.size()).to.eq(1)
    })
  })
  describe('update', () => {
    it('can update the entity record', async () => {
      const someEntity1Updated = {
        id: someEntity1.id,
        name: 'some entity 1 with a new name'
      }
      await repository.add(someEntity1)
      expect(await repository.size()).to.eq(1)
      await repository.update(someEntity1Updated)
      expect(await repository.size()).to.eq(1)
      expect(await repository.find(someEntity1.id)).to.eq(someEntity1Updated)
    })
  })
})
