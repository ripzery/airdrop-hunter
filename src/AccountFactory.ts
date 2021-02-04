import Web3 from 'web3';
import {Account} from './types';
import {saveToFile} from './utils/file';
// Generate Accounts and Write Log
export default class AccountFactory {
  web3: Web3;
  accounts: Account[] = [];

  constructor() {
    this.web3 = new Web3(process.env.PROVIDER || '');
  }

  createAccount(total: number, outputPath: string = './recipients') {
    this.accounts = [];
    for (let i = 0; i < total; i++) {
      const {address, privateKey} = this.web3.eth.accounts.create();
      this.accounts.push({address, privateKey});
    }
    saveToFile(this.accounts, outputPath);
  }
}
