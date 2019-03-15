// In-memory implementation of PortAccess references for MVP
export interface PortAccess {
  [port: number]: boolean
}

let portRange: PortAccess = {}

export function initializePortReferences (lowerPortBound: number, upperPortBound: number): PortAccess {
  let portRange: PortAccess = {}

  while (lowerPortBound <= upperPortBound) {
    portRange[lowerPortBound] = false
    lowerPortBound++
  }

  return portRange
}

export function initialize () {
  const {
    LOWER_PORT_BOUND,
    UPPER_PORT_BOUND
  } = process.env

  portRange = initializePortReferences(
    Number(LOWER_PORT_BOUND),
    Number(UPPER_PORT_BOUND)
  )
}

export function update (port: number, status: boolean) {
  portRange[port] = status
}

export function find (port: number): boolean {
  return portRange[port]
}

export function findAll (): PortAccess {
  return portRange
}
