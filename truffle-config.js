const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const HDWalletProvider = require('@truffle/hdwallet-provider');

// Add a check to ensure the private key is loaded
if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in the .env file. Please ensure it is defined.");
}

// Defensively remove '0x' prefix if it exists
const privateKey = process.env.PRIVATE_KEY.startsWith('0x')
  ? process.env.PRIVATE_KEY.slice(2)
  : process.env.PRIVATE_KEY;

module.exports = {
  // 修正路径：以项目根目录为起点
  contracts_directory: './contracts',          // 正确：根目录下的 contracts 文件夹
  contracts_build_directory: './build/contracts', // 建议：根目录下单独的 build 文件夹（避免与 contracts 嵌套）
  migrations_directory: './migrations',        // 迁移脚本放在根目录 migrations 文件夹（而非 contracts/migrations）
  test_directory: './test',                    // 测试脚本放在根目录 test 文件夹

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

  // 网络配置
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      networkCheckTimeout: 10000 // Add this line (in milliseconds)
    },

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
