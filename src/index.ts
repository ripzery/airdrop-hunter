require('dotenv').config();
import AccountFactory from './AccountFactory'
import MultiSender from './MultiSender';
import BN from 'bignumber.js'
import { Account } from './types';

const sender: Account = { address: process.env.SENDER_ADDRESS || '', privateKey: process.env.SENDER_PRIVATE_KEY || '' }
const factory = new AccountFactory('./output.json');
factory.createAccount(100);
const multisender = new MultiSender(sender, factory.accounts)

async function send() {
  await multisender.sendEther(new BN('10000000000000000'))
  process.exit(0)
}

send()
