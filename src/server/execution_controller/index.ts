import { contractExecutionAdapter, SmartContractEngine, ContractExecutionInstruction } from './lib/adapter'

export interface ContractExecutionOptions {
  web3Provider?: string
  plutus?: {
    executionEndpoint: string
    walletEndpoint: string
  }
  clientProxiUri?: string
}

export class ContractExecution {
  private executionOptions: ContractExecutionOptions

  constructor (opts: ContractExecutionOptions) {
    this.executionOptions = opts
  }

  public readContract (payload: ContractExecutionInstruction): any {
    return contractExecutionAdapter.readContract(payload, this.executionOptions)
  }

  public executeContract (payload: ContractExecutionInstruction): any {
    return contractExecutionAdapter.executeContract(payload, this.executionOptions)
  }

  public submitSignedTransaction ({ signedTransaction, engine }: { signedTransaction: string, engine: SmartContractEngine }): any {
    return contractExecutionAdapter.submitSignedTransaction({ signedTransaction, engine }, this.executionOptions)
  }
}
