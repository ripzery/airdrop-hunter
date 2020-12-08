import Web3 from 'web3'
import { TxDetails } from '../types'

export default class Transaction {
  private web3: Web3
  gasPrice: string

  constructor(gasPrice: string = '1000000000') {
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
    this.gasPrice = gasPrice
  }

  async send(txDetails: TxDetails, privateKey: string) {
    const gas = await this.web3.eth.estimateGas(txDetails)
    const signedTx = await this.web3.eth.accounts.signTransaction({...txDetails, gas, gasPrice: this.gasPrice}, privateKey)
    return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction || '')
  }
}
