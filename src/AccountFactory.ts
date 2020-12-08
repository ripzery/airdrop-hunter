import Web3 from 'web3';
import { Account } from './types';
import fs from 'fs'

// Generate Accounts and Write Log
export default class AccountFactory {
  web3: Web3;
  accounts: Account[] = [];

  constructor() {
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
  }

  createAccount(total: number, outputPath: string = './recipients') {
    this.accounts = [];
    for (let i = 0; i < total; i++) {
      const {address, privateKey} = this.web3.eth.accounts.create();
      this.accounts.push({address, privateKey});
    }
    this.saveToFile(outputPath);
  }

  saveToFile(outputPath: string = './recipients') {
    fs.writeFileSync(outputPath, JSON.stringify(this.accounts, null, 2))
  }
}
