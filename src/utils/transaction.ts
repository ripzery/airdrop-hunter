import Web3 from 'web3'
import { TxDetails, TransactionOption } from '../types'

export default class Transaction {
  private web3: Web3
  gasPrice: string

  constructor(txOptions: TransactionOption) {
    if(!txOptions || !txOptions.gasPrice) throw new Error('Gas price has not been set.')

    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
    this.gasPrice = txOptions.gasPrice
  }

  async send(txDetails: TxDetails, privateKey: string) {
    let gas
    if(!txDetails.gas) {
      gas = await this.web3.eth.estimateGas(txDetails)
    } else {
      gas = parseInt(txDetails.gas) + 50000
    }
    const signedTx = await this.web3.eth.accounts.signTransaction({...txDetails, gas, gasPrice: this.gasPrice}, privateKey)
    return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction || '')
  }
}
