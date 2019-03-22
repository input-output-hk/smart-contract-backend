import { Observable, interval } from 'rxjs'
import { distinctUntilChanged, mergeMap, pluck, takeWhile } from 'rxjs/operators'
import { AxiosResponse } from 'axios'
import { fetchAddresses, fetchBlockHeight } from './wallet'

const isSuccessResponse = (response: AxiosResponse) =>
  ([200, 201, 204].includes(response.status))

export function subscribeToAddresses (addresses: string[], walletUrl: string): Observable<any> {
  return interval(500).pipe(
    mergeMap(_ => fetchAddresses(addresses, walletUrl)),
    takeWhile(isSuccessResponse),
    pluck('data'),
    distinctUntilChanged()
  )
}

export function subscribeToBlockHeight (walletUrl: string): Observable<any> {
  return interval(5000).pipe(
    mergeMap(_ => fetchBlockHeight(walletUrl)),
    takeWhile(isSuccessResponse),
    pluck('data'),
    distinctUntilChanged()
  )
}
