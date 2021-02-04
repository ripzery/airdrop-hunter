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

  async sendBackTokens(token: string, accounts: Account[], option: TransactionOption, outputPathSendUsdt: string) {
    const contract = new this.web3.eth.Contract(erc20Abi, token)

    const balances = await Promise.all(accounts
      .map(({ address }) => contract.methods.balanceOf(address).call())
      ).then(balances => balances.filter(balance => parseInt(balance) > parseInt(usdtToWei('2'))))

    const pendingTxs = balances.map((balance, index) => {
      const encodedAbi = contract.methods.transfer(process.env.SENDER_ADDRESS, balance).encodeABI()
      const txDetails = {
        from: accounts[index].address,
        to: token,
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
