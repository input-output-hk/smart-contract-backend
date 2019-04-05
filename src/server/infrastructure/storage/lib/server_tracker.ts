// In-memory implementation of ContractServer references for MVP
import { ServerInfo } from 'apollo-server'
import { SmartContractEngine } from '../../../execution_controller/lib/adapter'

export interface ContractServer {
  port: number
  contractAddress: string
  engine: SmartContractEngine
  graphQlSchema: any
  graphQlInstance: ServerInfo
}

let serverTracker: ContractServer[]

export function initialize () {
  serverTracker = []
}

export function find (contractAddress: string): ContractServer {
  return serverTracker.find(server => server.contractAddress === contractAddress)
}

export function findAll (): ContractServer[] {
  return serverTracker
}

export function create (server: ContractServer) {
  serverTracker.push(server)
}

export function remove (contractAddress: string) {
  serverTracker = serverTracker.filter((st) => st.contractAddress !== contractAddress)
}
