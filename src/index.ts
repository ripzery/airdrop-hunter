require('dotenv').config();
import { BigNumber } from '@dydxprotocol/solo';
import AccountFactory from './AccountFactory'
import MultiSender from './MultiSender';
import { Account } from './types';
import DyDx from './target/DyDx';
import { ethToWei, weiToEth } from './utils/unit'

// Minimum 0.05 ETH per account
const amountToSend = ethToWei('0.05')

// Number of accounts to create
const totalAccounts = 10

// Output path for multi-sender transaction
const outputPathMultiSender = './output/result-multisender.json'

// Output path for dydx deposit transaction
const outputPathDyDx = './output/result-dydx.json'

// Output path for accounts creation.
const outputPathAccounts = './output/recipients.json'

// A wallet which will distribute tokens to multiple wallets
const sender: Account = { address: process.env.SENDER_ADDRESS || '', privateKey: process.env.SENDER_PRIVATE_KEY || '' }



async function execute() {
  console.log('\n===== BEGIN =====\n')
  console.log(`1. Creating ${totalAccounts} accounts...`)
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`${totalAccounts} accounts created!`, outputPathAccounts)

  const multisender = new MultiSender(sender, factory.accounts)
  const dydx = new DyDx(factory.accounts)

  console.log('\n=================\n')
  console.log('2. Splitting ETH...')
  await multisender.sendEther(new BigNumber(amountToSend), outputPathMultiSender)
  console.log(`${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`, outputPathMultiSender)

  console.log('\n=================\n')
  const depositAmount = new BigNumber(amountToSend).div(5)
  console.log(`3. Batch depositing ${weiToEth(depositAmount.toString(10))} ETH to DyDx...`)
  await dydx.batchDeposit(depositAmount, outputPathDyDx)
  console.log('Deposit completed!', outputPathDyDx)

  console.log('\nDone.')
  process.exit(0)
}

execute()
