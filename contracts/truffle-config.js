
require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    // 移除或注释原 Mumbai 配置，添加 Amoy 配置
    amoy: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,  // 部署钱包私钥
        process.env.PROVIDER_URL  // Amoy 节点 URL（见下文说明）
      ),
      network_id: 80002,  // Amoy 测试网链 ID（固定值）
      gas: 5500000,       // 建议的 Gas 限制
      confirmations: 2,   // 区块确认数
      timeoutBlocks: 200, // 超时区块数
      skipDryRun: true    // 跳过 dry run（测试网可选）
    }
  },

  // 编译器配置（保持不变，确保与 OpenZeppelin 5.4.0 兼容）
  compilers: {
    solc: {
      version: "0.8.24",  // 与 Amoy 测试网兼容的 Solidity 版本
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};