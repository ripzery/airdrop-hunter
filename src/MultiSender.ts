import { Account } from "./types";
import Web3 from 'web3'
import { multiSenderAbi } from './abi'
import BN from 'bignumber.js'
import Transaction from './utils/transaction'
import { saveToFile } from './utils/file'

export default class MultiSender {
  sender: Account
  recipients: Account[]
  web3: Web3
  transaction: Transaction

  constructor(
    sender: Account,
    recipients: Account[]
  ) {
    this.sender = sender
    this.recipients = recipients;
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
    this.transaction = new Transaction()
  }

  async sendEther(ethPerWallet: BN, outputPath: string) {
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
      to: process.env.MULTISENDER_CONTRACT || ''
    }
    return this.transaction.send(txDetails, this.sender.privateKey)
      .then(result => {
        return {
          from: result.from,
          to: result.to,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      })
      .then(result => {
        saveToFile(result, outputPath)
        return result
      })
  }
}
