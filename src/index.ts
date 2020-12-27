require('dotenv').config();
import { BigNumber } from '@dydxprotocol/solo';
import AccountFactory from './AccountFactory'
import MultiSender from './MultiSender';
import { Account } from './types';
import DyDx from './target/DyDx';
import Matcha from './target/Matcha'
import { ethToWei, weiToEth, gweiToWei } from './utils/unit'
import chalk from 'chalk';

// Minimum 0.05 ETH per account
const amountToSend = ethToWei('0.1')

// Number of accounts to create
const totalAccounts = 25

// Gas price for multi sender
const gasPrice = gweiToWei('91')

// A wallet which will distribute tokens to multiple wallets
const sender: Account = { address: process.env.SENDER_ADDRESS || '', privateKey: process.env.SENDER_PRIVATE_KEY || '' }

async function execute_dydx() {
  // Output path for multi-sender transaction
  const outputPathMultiSender = './output/dydx/result-multisender.json'

  // Output path for dydx deposit transaction
  const outputPathTransaction = './output/dydx/result-transaction.json'

  // Output path for accounts creation.
  const outputPathAccounts = './output/dydx/recipients.json'

  validate_params()

  console.log('\n===== BEGIN =====\n')
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`))
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`> ${totalAccounts} accounts created!`, outputPathAccounts)

  const multisender = new MultiSender(sender, factory.accounts, { gasPrice })
  const dydx = new DyDx(factory.accounts)

  console.log('\n=================\n')
  console.log(chalk.greenBright('2. Splitting ETH...\n'))
  await multisender.sendEther(new BigNumber(amountToSend), outputPathMultiSender)
  console.log(`> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`, outputPathMultiSender)

  console.log('\n=================\n')
  const depositAmount = new BigNumber(amountToSend).div(5)
  console.log(chalk.greenBright(`3. Batch depositing ${weiToEth(depositAmount.toString(10))} ETH to DyDx...\n`))
  await dydx.batchDeposit(depositAmount, outputPathTransaction)
  console.log('> Deposit completed!', outputPathTransaction)

  console.log('\nDone.')
  process.exit(0)
}

async function execute_matcha(amount: string) {
  validate_params()

  // Output path for multi-sender transaction
  const outputPathMultiSender = './output/matcha/result-multisender.json'

  // Output path for dydx deposit transaction
  const outputPathTransaction = './output/matcha/result-transaction.json'

  // Output path for accounts creation.
  const outputPathAccounts = './output/matcha/recipients.json'

  console.log('\n===== BEGIN =====\n')
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`))
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`> ${totalAccounts} accounts created!`, outputPathAccounts)

  const multisender = new MultiSender(sender, factory.accounts, { gasPrice })

  console.log('\n=================\n')
  console.log(chalk.greenBright('2. Splitting ETH...\n'))
  await multisender.sendEther(new BigNumber(amountToSend), outputPathMultiSender)
  console.log(`> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`, outputPathMultiSender)

  console.log('\n=================\n')
  console.log(chalk.greenBright('3. Batch Swapping ETH to ' + amount + ' USDT...\n'))

  const matcha = new Matcha(factory.accounts)
  await matcha.swap(amount, outputPathTransaction)

  console.log('> Swap completed!', outputPathTransaction)

  console.log('\nDone.')
  process.exit(0)
}

function validate_params() {
  if(parseFloat(amountToSend) < parseFloat(ethToWei('0.05'))) {
    throw new Error(chalk.redBright('Too low amount for each wallet. Require minimum 0.05 ETH per wallet.'))
  }

  if(totalAccounts < 1) {
    throw new Error(chalk.redBright('Require totalAccounts >= 1.'))
  }
}

async function withdraw(accounts: Account[]) {
  const outputSendUsdt = './output/matcha/result-withdraw.json'
  const matcha = new Matcha(accounts)

  console.log('\n=================\n')
  console.log(chalk.greenBright('Batch Withdrawal USDT to ' + process.env.SENDER_ADDRESS + ' ...\n'))

  await matcha.sendUSDTBack({ gasPrice }, outputSendUsdt)

  console.log('\nDone.')
  process.exit(0)
}

function execute() {

  // execute_dydx()

  // Amount to trade on matcha for each account
  //   const amount = '25' // 25 USDT
  //   execute_matcha(amount)

  const accounts = require('../output/matcha/recipients.json')
  withdraw(accounts)
}

execute()
