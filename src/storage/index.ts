import * as portAccess from './port_access'
import * as serverTracker from './server_tracker'
export { ContractServer } from './server_tracker'
export { PortAccess } from './port_access'

interface StorageInteractions<Collection, Id, Value> {
  initialize(): void
  create(item: Value): void
  find(identifier: Id): Value
  findAll(): Collection
  update(identifier: Id, value: Value): void
  remove(identifier: Id): void
}

export const availablePorts: StorageInteractions<portAccess.PortAccess, number, boolean> = {
  initialize: portAccess.initialize,
  create: () => { throw new Error('No create operation for Port Access storage') },
  find: portAccess.find,
  findAll: portAccess.findAll,
  update: portAccess.update,
  remove: () => { throw new Error('No delete operation for Port Access storage') }
}

export const contractServers: StorageInteractions<serverTracker.ContractServer[], string, serverTracker.ContractServer> = {
  initialize: serverTracker.initialize,
  create: serverTracker.create,
  find: serverTracker.find,
  findAll: serverTracker.findAll,
  update: () => { throw new Error('No update operation for Server Tracker storage') },
  remove: serverTracker.remove
}
