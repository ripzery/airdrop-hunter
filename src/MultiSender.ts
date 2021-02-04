import { Account, TransactionOption } from "./types";
import { BigNumber } from '@dydxprotocol/solo'
import Web3 from 'web3'
import { multiSenderAbi, erc20Abi } from './abi'
import Transaction from './utils/transaction'
import { saveToFile } from './utils/file'
import { ethToWei } from './utils/unit'

export default class MultiSender {
  sender: Account
  recipients: Account[]
  web3: Web3
  transaction: Transaction

  constructor(
    sender: Account,
    recipients: Account[],
    options: TransactionOption
  ) {
    this.sender = sender
    this.recipients = recipients;
    this.web3 = new Web3(process.env.PROVIDER || '');
    this.transaction = new Transaction(options)
  }

  async sendEther(ethPerWallet: BigNumber, outputPath: string) {
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
    console.log(txDetails)
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

  async sendErc20(address: string, amount: BigNumber, outputPath: string) {
    const erc20Contract = new this.web3.eth.Contract(erc20Abi, address)
    const allowance = await erc20Contract.methods.allowance(this.sender.address, process.env.MULTISENDER_CONTRACT).call()

    if(allowance === '0') {
      console.log('Required allowance')
      const approveAmount = ethToWei('1000')
      const approveData = await erc20Contract.methods.approve(process.env.MULTISENDER_CONTRACT, approveAmount).encodeABI({
        from: this.sender.address
      })

       const approveTxDetails = {
        from: this.sender.address,
        data: approveData,
        to: address || ''
      }

      const approveTx = await this.transaction.send(approveTxDetails, this.sender.privateKey)
      .then(result => {
        return {
          from: result.from,
          to: result.to,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      })

      console.log(approveTx)
    }

    const contractMultiSender = new this.web3.eth.Contract(multiSenderAbi, process.env.MULTISENDER_CONTRACT)
    const values = new Array(this.recipients.length).fill(amount)
    const data = contractMultiSender.methods.multisendErc20(address, this.recipients.map(recipient => recipient.address), values).encodeABI({
      from: this.sender.address,
    })

    const txDetails = {
      from: this.sender.address,
      data,
      to: process.env.MULTISENDER_CONTRACT || ''
    }
    console.log(txDetails)
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
