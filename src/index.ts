require('dotenv').config();
import AccountFactory from './AccountFactory'
import MultiSender from './MultiSender';
import BN from 'bignumber.js'
import { Account } from './types';
import DyDx from './target/DyDx';

const amountToSend = '1000000000000000'
const totalAccounts = 5
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
  await multisender.sendEther(new BN(amountToSend + '0'), outputPathMultiSender)
  console.log(`${amountToSend} wei was sent to ${totalAccounts} accounts!`, outputPathMultiSender)
  console.log('\n=================\n')
  console.log('Batch depositing to DyDx...')
  await dydx.batchDeposit(amountToSend, outputPathDyDx)
  console.log('Deposit completed!', outputPathDyDx)
  console.log('\nDone.')
  process.exit(0)
}

execute()
