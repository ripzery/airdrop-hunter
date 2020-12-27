import Transaction from "./utils/transaction"

export interface Account {
  address: string;
  privateKey: string;
}

export interface TxDetails {
  from: string;
  data: string;
  value?: string;
  to: string;
  gas?: string;
  gasPrice?: string;
}

export interface TransactionOption {
  gasPrice: string;
}
