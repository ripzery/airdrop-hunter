require('dotenv').config();
import {BigNumber} from '@dydxprotocol/solo';
import AccountFactory from './AccountFactory';
import MultiSender from './MultiSender';
import {Account} from './types';
import DyDx from './target/DyDx';
import Matcha from './target/Matcha';
import Transfer from './Transfer';
import {ethToWei, weiToEth, gweiToWei} from './utils/unit';
import chalk from 'chalk';
import fs from 'fs';

// Minimum 0.003 ETH per account
const amountToSend = ethToWei('0.003');

// Number of accounts to create
const totalAccounts = 125;

// Gas price for multi sender
const gasPrice = gweiToWei('24');

// A wallet which will distribute tokens to multiple wallets
const sender: Account = {
  address: process.env.SENDER_ADDRESS || '',
  privateKey: process.env.SENDER_PRIVATE_KEY || '',
};

const kebab = '0x7979f6c54eba05e18ded44c4f986f49a5de551c2';
const bamboo = '0x2eb5ecc40e403b12ee4428d70fddf34e2c2c27b0';
const icecream = '0x191d90B48c41aA4F65827B060C21FbDD374de801';

// BSC chain
async function execute_icecream() {
  // Output path for multi-sender bnb transaction
  const outputPathMultiSenderBnb =
    './output/icecream/result-multisender-bnb.json';

  // Output path for multi-sender kebab transaction
  const outputPathMultiSenderKebab =
    './output/icecream/result-multisender-kebab.json';

  const outputPathMultiSenderBamboo =
    './output/icecream/result-multisender-bamboo.json';

  // Output path for accounts creation.
  const outputPathAccounts = './output/icecream/recipients.json';

  validate_params();

  console.log('\n===== BEGIN =====\n');
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`));
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`> ${totalAccounts} accounts created!`, outputPathAccounts);

  const multisender = new MultiSender(sender, factory.accounts, {gasPrice});

  console.log('\n=================\n');
  console.log(chalk.greenBright('2. Splitting BNB...\n'));
  await multisender.sendEther(
    new BigNumber(amountToSend),
    outputPathMultiSenderBnb
  );
  console.log(
    `> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`,
    outputPathMultiSenderBnb
  );

  console.log('\n=================\n');
  const amountKebab = ethToWei('0.00001');
  console.log(chalk.greenBright('3. Splitting Kebab...\n'));
  await multisender.sendErc20(
    kebab,
    new BigNumber(amountKebab),
    outputPathMultiSenderKebab
  );
  console.log(
    `> ${weiToEth(amountKebab)} KEBAB was sent to ${totalAccounts} accounts!`,
    outputPathMultiSenderKebab
  );

  // console.log('\n=================\n')
  // const amountBamboo = ethToWei('0.00001')
  // console.log(chalk.greenBright('4. Splitting Bamboo...\n'))
  // await multisender.sendErc20(bamboo, new BigNumber(amountBamboo), outputPathMultiSenderBamboo)
  // console.log(`> ${weiToEth(amountBamboo)} BAMBOO was sent to ${totalAccounts} accounts!`, outputPathMultiSenderBamboo)

  console.log('\nDone.');
  process.exit(0);
}

async function execute_dydx() {
  // Output path for multi-sender transaction
  const outputPathMultiSender = './output/dydx/result-multisender.json';

  // Output path for dydx deposit transaction
  const outputPathTransaction = './output/dydx/result-transaction.json';

  // Output path for accounts creation.
  const outputPathAccounts = './output/dydx/recipients.json';

  validate_params();

  console.log('\n===== BEGIN =====\n');
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`));
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`> ${totalAccounts} accounts created!`, outputPathAccounts);

  const multisender = new MultiSender(sender, factory.accounts, {gasPrice});
  const dydx = new DyDx(factory.accounts);

  console.log('\n=================\n');
  console.log(chalk.greenBright('2. Splitting ETH...\n'));
  await multisender.sendEther(
    new BigNumber(amountToSend),
    outputPathMultiSender
  );
  console.log(
    `> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`,
    outputPathMultiSender
  );

  console.log('\n=================\n');
  const depositAmount = new BigNumber(amountToSend).div(5);
  console.log(
    chalk.greenBright(
      `3. Batch depositing ${weiToEth(
        depositAmount.toString(10)
      )} ETH to DyDx...\n`
    )
  );
  await dydx.batchDeposit(depositAmount, outputPathTransaction);
  console.log('> Deposit completed!', outputPathTransaction);

  console.log('\nDone.');
  process.exit(0);
}

async function execute_matcha(amount: string) {
  validate_params();

  // Output path for multi-sender transaction
  const outputPathMultiSender = './output/matcha/result-multisender.json';

  // Output path for dydx deposit transaction
  const outputPathTransaction = './output/matcha/result-transaction.json';

  // Output path for accounts creation.
  const outputPathAccounts = './output/matcha/recipients.json';

  console.log('\n===== BEGIN =====\n');
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`));
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);
  console.log(`> ${totalAccounts} accounts created!`, outputPathAccounts);

  const multisender = new MultiSender(sender, factory.accounts, {gasPrice});

  console.log('\n=================\n');
  console.log(chalk.greenBright('2. Splitting ETH...\n'));
  await multisender.sendEther(
    new BigNumber(amountToSend),
    outputPathMultiSender
  );
  console.log(
    `> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`,
    outputPathMultiSender
  );

  console.log('\n=================\n');
  console.log(
    chalk.greenBright('3. Batch Swapping ETH to ' + amount + ' USDT...\n')
  );

  const matcha = new Matcha(factory.accounts);
  await matcha.swap(amount, outputPathTransaction);

  console.log('> Swap completed!', outputPathTransaction);

  console.log('\nDone.');
  process.exit(0);
}

function validate_params() {
  if (parseFloat(amountToSend) < parseFloat(ethToWei('0.003'))) {
    throw new Error(
      chalk.redBright(
        'Too low amount for each wallet. Require minimum 0.05 ETH per wallet.'
      )
    );
  }

  if (totalAccounts < 1) {
    throw new Error(chalk.redBright('Require totalAccounts >= 1.'));
  }
}

// Aggregates back to account
async function withdraw(token: string, accounts: Account[]) {
  const outputWithdrawToken = './output/collect/result-withdraw.json';
  const transfer = new Transfer();

  console.log('\n=================\n');
  console.log(
    chalk.greenBright(
      'Batch Withdrawal token to ' + process.env.SENDER_ADDRESS + ' ...\n'
    )
  );

  await transfer.sendBackTokens(
    token,
    accounts,
    {gasPrice},
    outputWithdrawToken
  );

  console.log('\nDone.');
  process.exit(0);
}

async function withdraw_eth(accounts: Account[]) {
  const outputCollectEth = './output/collect/result-withdraw-eth.json';
}

async function create_metamask_accounts() {
  const outputPathAccounts = './output/metamask/recipients.json';

  console.log('\n===== BEGIN =====\n');
  console.log(chalk.greenBright(`1. Creating ${totalAccounts} accounts...\n`));
  const factory = new AccountFactory();
  factory.createAccount(totalAccounts, outputPathAccounts);

  console.log('\n=================\n');
  console.log(chalk.greenBright('2. Splitting ETH...\n'));
  const outputPathMultiSender = './output/metamask/result-multisender.json';

  const multisender = new MultiSender(sender, factory.accounts, {gasPrice});
  await multisender.sendEther(
    new BigNumber(amountToSend),
    outputPathMultiSender
  );
  console.log(
    `> ${weiToEth(amountToSend)} eth was sent to ${totalAccounts} accounts!`,
    outputPathMultiSender
  );

  console.log('\nDone.');
  process.exit(0);
}

async function combine_ice_cream() {
  const basePath = './icecream';
  const folders = fs.readdirSync(basePath);
  const recipients = folders.map(folder => {
    return JSON.parse(
      fs.readFileSync(basePath + '/' + folder + '/recipients.json', 'utf-8')
    )
  });
  const totalRecipients: Account[] = [];
  recipients.forEach(recipients_per_round =>
    totalRecipients.push(...recipients_per_round)
  );
  console.log('Total recipients:', totalRecipients.length);
  await withdraw(icecream, totalRecipients);
}

combine_ice_cream();
