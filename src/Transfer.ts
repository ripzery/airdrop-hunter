import { Account, TransactionOption} from './types'
import { erc20Abi } from './abi'
import Transaction from './utils/transaction'
import { usdtToWei } from './utils/unit'
import { saveToFile } from './utils/file'
import Web3 from "web3"

export default class Transfer {
  web3: Web3

  constructor() {
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`)
  }

  async sendUSDT(accounts: Account[], option: TransactionOption, outputPathSendUsdt: string) {
    const usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const contract = new this.web3.eth.Contract(erc20Abi, usdt)

    const balances = await Promise.all(accounts
      .map(({ address }) => contract.methods.balanceOf(address).call())
      ).then(balances => balances.filter(balance => parseInt(balance) > parseInt(usdtToWei('2'))))

    console.log(balances)

    const pendingTxs = balances.map((balance, index) => {
      const encodedAbi = contract.methods.transfer(process.env.SENDER_ADDRESS, balance).encodeABI()
      const txDetails = {
        from: accounts[index].address,
        to: usdt,
        data: encodedAbi
      }

      const transaction = new Transaction(option)
      return transaction.send(txDetails, accounts[index].privateKey)
      .then(result => {
        return {
          from: result.from,
          to: result.to,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      })
    })

    return await Promise.all(pendingTxs)
    .then(result => {
      saveToFile(result, outputPathSendUsdt)
      return result
    })
  }

  async sendEth() {

  }

}
