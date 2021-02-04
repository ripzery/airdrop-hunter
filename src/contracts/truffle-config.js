require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard BSC port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    testnet: {
      provider: () => new HDWalletProvider(process.env.SENDER_PRIVATE_KEY, process.env.TESTNET_PROVIDER),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc: {
      provider: () => new HDWalletProvider(process.env.SENDER_PRIVATE_KEY, process.env.PROVIDER),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  plugins: [
    'truffle-plugin-verify'
  ],

  api_keys: {
    'etherscan': "VCKWHFAA6M5AR8SFVXC43DEMEA8JN2H3WZ",
    'bscscan': "X878A9QFMVJV5D3EWS141XSN4BYBVCFXKN" 
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.7.4",
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
       }
    },
  },
  
}