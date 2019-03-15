import { contractExecutionAdapter, SmartContractEngine, ContractExecutionInstruction } from './lib/adapter'

export interface ContractExecutionOptions {
  web3Provider?: string
  plutusProvider?: string
  cardanoClientProxiUri?: string
}

export class ContractExecution {
  private executionOptions: ContractExecutionOptions

  constructor(opts: ContractExecutionOptions) {
    this.executionOptions = opts
  }

  public publishNewContract(
    args: { engine: SmartContractEngine, address: string, name: string, contractCode: string }
  ): Promise<any> {
    return contractExecutionAdapter.publishNewContract(args, this.executionOptions.cardanoClientProxiUri)
  }

  public readContract(payload: ContractExecutionInstruction): any {
    return contractExecutionAdapter.readContract(payload, this.executionOptions)
  }

  public executeContract(payload: ContractExecutionInstruction): any {
    return contractExecutionAdapter.executeContract(payload, this.executionOptions)
  }

  public submitSignedTransaction({ signedTransaction, engine }: { signedTransaction: string, engine: SmartContractEngine }): any {
    return contractExecutionAdapter.submitSignedTransaction({ signedTransaction, engine }, this.executionOptions)
  }
}
