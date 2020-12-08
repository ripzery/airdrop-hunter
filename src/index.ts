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
factory.createAccount(totalAccounts, outputPathAccounts);
const multisender = new MultiSender(sender, factory.accounts)
const dydx = new DyDx(factory.accounts)

async function execute() {
  await multisender.sendEther(new BN(amountToSend + '0'), outputPathMultiSender)
  const results = await dydx.batchDeposit(amountToSend, outputPathDyDx)
  console.log(results)
  process.exit(0)
}

execute()
