import { AxiosInstance } from 'axios'
// Inherit the type from Axios
// We may wish to define this ourselves to remove the dependency in the application layer
export type NetworkInterface = AxiosInstance
