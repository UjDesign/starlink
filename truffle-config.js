require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

// 确保环境变量存在
const requiredEnvVars = ['PRIVATE_KEY', 'PROVIDER_URL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`错误：.env文件中缺少必要环境变量 ${varName}`);
    process.exit(1);
  }
});

module.exports = {
  // 修正路径：以项目根目录为起点
  contracts_directory: './contracts',          // 正确：根目录下的 contracts 文件夹
  contracts_build_directory: './build/contracts', // 建议：根目录下单独的 build 文件夹（避免与 contracts 嵌套）
  migrations_directory: './migrations',        // 迁移脚本放在根目录 migrations 文件夹（而非 contracts/migrations）
  test_directory: './test',                    // 测试脚本放在根目录 test 文件夹

  compilers: {
    solc: {
      version: "0.8.24",
      settings: {
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "london"
      },
      sources: ["./contracts/ContentNFT.sol", "./contracts/StarToken.sol"],
      exclude: ["**/node_modules/**/*", "**/*.vy"]
    }
  },

  // 网络配置
  networks: {
    // 本地开发网络（如Ganache）
    development: {
      host: "127.0.0.1",
      port: 7545,                               // Ganache默认端口
      network_id: "*",                          // 匹配任何网络ID
      gas: 6721975,                             // 本地测试Gas限制
      gasPrice: 20000000000                     // 20 gwei
    },

    // Polygon Amoy测试网配置
    amoy: {
      provider: () => new HDWalletProvider(
        [process.env.PRIVATE_KEY], // 第1个参数：私钥数组（支持多私钥，用数组包裹）
        process.env.PROVIDER_URL   // 第2个参数：节点URL字符串（无需嵌套对象）
      ),
      network_id: 80002,          // Amoy链ID（必须正确）
      gas: 5500000,               // 显式Gas限制（避免自动获取失败）
      gasPrice: 30000000000,      // 30 gwei（Amoy测试网稳定值）
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 10000  // 网络检查超时（10秒，避免卡顿）
    },

    // 可选：Polygon主网配置（生产环境使用）
    polygon: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        "https://polygon-rpc.com"
      ),
      network_id: 137,
      gas: 5500000,
      gasPrice: 300000000000,                   // 300 gwei（主网实时调整）
      confirmations: 6,
      timeoutBlocks: 200,
      skipDryRun: false                         // 主网必须执行预部署检查
    }
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
    