import { Solo, Networks, BigNumber, MarketId, AccountNumbers } from '@dydxprotocol/solo';
import { Account } from '../types'
import { saveToFile } from '../utils/file'

export default class DyDx {
  client: Solo
  accounts: Account[]

  constructor(accounts: Account[]) {
    const network = this.getNetwork()
    this.accounts = accounts
    this.client = new Solo(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`,
      network,
      {
        defaultAccount: accounts[0].address,
        accounts
      }
    )
  }

  deposit(account: Account, amount: string) {
    return this.client.standardActions.deposit({
      accountOwner: account.address,
      accountNumber: AccountNumbers.SPOT,
      amount: new BigNumber(amount).div(2),
      marketId: MarketId.ETH,
    }).then(result => {
      return {
        from: result.from,
        to: result.to,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed
      }
    })
  }

  batchDeposit(amount: string, outputPath: string) {
    const pending = this.accounts.map(account => this.deposit(account, amount))
    return Promise.all(pending)
    .then(results => {
      saveToFile(results, outputPath)
      return results
    })
  }

  private getNetwork() {
    switch(process.env.CHAIN) {
      case 'kovan':
        return Networks.KOVAN
      case 'mainnet':
        return Networks.MAINNET
      default:
        throw new Error(process.env.CHAIN + ' is not supported.')
    }
  }
}
