import Web3 from 'web3'
import qs from 'querystring'
import Transaction from '../utils/transaction'
import { usdtToWei } from '../utils/unit'
import Axios from 'axios'
import { erc20Abi } from '../abi'
import { Account, TransactionOption } from '../types'
import { saveToFile } from '../utils/file'

export default class Matcha {
  accounts: Account[]
  web3: Web3
  buyToken: string = 'USDT'

  constructor(accounts: Account[]){
    this.accounts = accounts
    this.web3 = new Web3(
      `https://${process.env.CHAIN}.infura.io/v3/${process.env.INFURA_API_KEY}`
    )

  }

  /**
   * Swap ETH with USDT
   * @param eth amount of eth in eth unit (the highest unit)
   */
  swap(usdt: string, outputPath: string) {
    const pendingTxs = this.accounts.map(async account => {
      const params = {
        buyToken: 'USDT',
        buyAmount: usdtToWei(usdt),
        sellToken: 'ETH',
        includedSources: 'UniswapV2,SushiSwap,Balancer,0x'
      }
      const txDetails = await Axios.get(`https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`)
        .then(response => response.data)
      const transaction = new Transaction({ gasPrice: txDetails.gasPrice })
      return transaction.send(txDetails, account.privateKey)
        .then(result => {
          return {
            from: result.from,
            to: result.to,
            transactionHash: result.transactionHash,
            gasUsed: result.gasUsed
          }
        })
    })

    return Promise.all(pendingTxs)
    .then(result => {
      saveToFile(result, outputPath)
      return result
    })
  }

  async sendUSDTBack(option: TransactionOption, outputPathSendUsdt: string) {
    const usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const contract = new this.web3.eth.Contract(erc20Abi, usdt)

    const balances = await Promise.all(this.accounts
      .map(({ address }) => contract.methods.balanceOf(address).call())
      ).then(balances => balances.filter(balance => parseInt(balance) > parseInt(usdtToWei('2'))))

    console.log(balances)

    const pendingTxs = balances.map((balance, index) => {
      const encodedAbi = contract.methods.transfer(process.env.SENDER_ADDRESS, balance).encodeABI()
      const txDetails = {
        from: this.accounts[index].address,
        to: usdt,
        data: encodedAbi
      }

      const transaction = new Transaction(option)
      return transaction.send(txDetails, this.accounts[index].privateKey)
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

  sendETHBack() {

  }
}
