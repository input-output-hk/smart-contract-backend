import { Bundle } from '../core'

export interface BundleFetcher {
  fetch: (uri: string) => Promise<Bundle>
}
