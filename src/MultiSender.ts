import { Account } from "./types";
import Web3 from 'web3'
import { erc20Abi, multiSenderAbi } from './abi'
import BN from 'bignumber.js'

export default class MultiSender {
  sender: Account
  recipients: Account[]
  web3: Web3

  constructor(
    sender: Account,
    recipients: Account[]
  ) {
    this.sender = sender
    this.recipients = recipients;
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
  }

  approve(token: string) {
    const contractErc20 = new this.web3.eth.Contract(erc20Abi, token)
  }

  async sendEther(ethPerWallet: BN) {
    const contractMultiSender = new this.web3.eth.Contract(multiSenderAbi, process.env.MULTISENDER_CONTRACT)
    const values = new Array(this.recipients.length).fill(ethPerWallet)
    const data = contractMultiSender.methods.multisend(this.recipients.map(recipient => recipient.address), values).encodeABI({
      from: this.sender.address,
    })
    const value = ethPerWallet
      .multipliedBy(this.recipients.length)
      .toString()
    const txDetails = {
      from: this.sender.address,
      data,
      value,
      to: process.env.MULTISENDER_CONTRACT
    }
    console.log(txDetails)
    const gas = await this.web3.eth.estimateGas(txDetails)
    const signedTx = await this.web3.eth.accounts.signTransaction({...txDetails, gas: gas + 100000, gasPrice: '1000000000'}, this.sender.privateKey)
    const tx = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction || '')
    console.log(tx)
  }
}
