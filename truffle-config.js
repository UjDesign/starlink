const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config({ path: '../.env' });

// Defensively remove '0x' prefix if it exists
const privateKey = process.env.PRIVATE_KEY.startsWith('0x')
  ? process.env.PRIVATE_KEY.slice(2)
  : process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      networkCheckTimeout: 10000 // Add this line (in milliseconds)
    },
    amoy: {
      provider: () => new HDWalletProvider(privateKey, process.env.PROVIDER_URL),
      network_id: 97,       // Replace with your network id
      gas: 6721975,         // Replace with your gas limit
      gasPrice: 20000000000 // Replace with your gas price
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.24", // You can use the latest version here
      docker: true,        // Set this to true
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
       evmVersion: "paris"
      }
    }
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // 插件配置（如需使用Truffle插件）
  plugins: [
    // "truffle-plugin-verify"  // 可选：用于合约验证（需额外配置）
  ],

  // 合约验证配置（如启用truffle-plugin-verify）
  // api_keys: {
  //   polygonscan: process.env.POLYGONSCAN_API_KEY
  // }
};
