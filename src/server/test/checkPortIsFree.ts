import * as tcpPortUsed from 'tcp-port-used'

export async function checkPortIsFree (port: number) {
  if (await tcpPortUsed.check(port, '127.0.0.1') === true) throw new Error('Port already allocated on host')
}
