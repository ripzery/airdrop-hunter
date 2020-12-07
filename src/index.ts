require('dotenv').config();
import AccountFactory from './AccountFactory'

const factory = new AccountFactory('./output.json');
factory.createAccount(100);
