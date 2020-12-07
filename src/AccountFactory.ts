import Web3 from 'web3';
import {Account} from './types';
import fs from 'fs'

// Generate Accounts and Write Log
export default class AccountFactory {
  outputPath: string;
  web3: Web3;
  accounts: Account[] = [];

  constructor(outputPath: string) {
    this.outputPath = outputPath;
    this.web3 = new Web3(
      'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY
    );
  }

  createAccount(total: number) {
    this.accounts = [];
    for (let i = 0; i < total; i++) {
      const {address, privateKey} = this.web3.eth.accounts.create();
      this.accounts.push({address, privateKey});
    }
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.outputPath, JSON.stringify(this.accounts, null, 2))
  }
}
