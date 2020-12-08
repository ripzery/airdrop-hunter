export interface Account {
  address: string;
  privateKey: string;
}

export interface TxDetails {
  from: string;
  data: string;
  value: string;
  to: string
}
