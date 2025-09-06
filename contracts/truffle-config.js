require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // 匹配任何网络
    },
    mumbai: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        process.env.PROVIDER_URL
      ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6721975,
      gasPrice: 20000000000 // 20 gwei
    }
  },
  compilers: {
    solc: {
      version: "0.8.24", // 与OpenZeppelin 5.4.0兼容的最新版本
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  contracts_build_directory: "./build/contracts"
};
    