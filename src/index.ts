require('dotenv').config();
import { BigNumber } from '@dydxprotocol/solo';
import AccountFactory from './AccountFactory'
import MultiSender from './MultiSender';
import { Account } from './types';
import DyDx from './target/DyDx';
import { ethToWei, weiToEth } from './utils/unit'

// Minimum 0.05 ETH per account
const amountToSend = ethToWei('0.05')
const totalAccounts = 10
const outputPathMultiSender = './output/result-multisender.json'
const outputPathDyDx = './output/result-dydx.json'
const outputPathAccounts = './output/recipients.json'

const sender: Account = { address: process.env.SENDER_ADDRESS || '', privateKey: process.env.SENDER_PRIVATE_KEY || '' }
const factory = new AccountFactory();

console.log('\n===== BEGIN =====\n')
console.log('Creating accounts...')
factory.createAccount(totalAccounts, outputPathAccounts);
console.log(`${totalAccounts} accounts created!`, outputPathAccounts)
const multisender = new MultiSender(sender, factory.accounts)
const dydx = new DyDx(factory.accounts)

async function execute() {
  console.log('\n=================\n')
  console.log('Splitting ETH...')
  await multisender.sendEther(new BigNumber(amountToSend), outputPathMultiSender)
  console.log(`${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`, outputPathMultiSender)
  console.log('\n=================\n')
  const depositAmount = new BigNumber(amountToSend).div(5)
  console.log(`Batch depositing ${weiToEth(depositAmount.toString(10))} ETH to DyDx...`)
  await dydx.batchDeposit(depositAmount, outputPathDyDx)
  console.log('Deposit completed!', outputPathDyDx)
  console.log('\nDone.')
  process.exit(0)
}

execute()
