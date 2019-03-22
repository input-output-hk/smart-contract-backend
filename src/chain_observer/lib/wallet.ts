import axios from 'axios'

export function fetchAddresses (addresses: string[], walletUrl: string) {
  return axios.get(`${walletUrl}/address?addresses=${addresses.join(',')}`)
}

export function fetchBlockHeight (walletUrl: string) {
  return axios.get(`${walletUrl}/blockHeight`)
}
