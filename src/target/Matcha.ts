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
}
