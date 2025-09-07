// ./migrations/2_deploy_contracts.js
const ContentNFT = artifacts.require("ContentNFT");
const StarToken = artifacts.require("StarToken");

module.exports = async function(deployer) {
  // 1. 部署 ContentNFT（构造函数需要：nftName, nftSymbol）
  await deployer.deploy(ContentNFT, "Starlink Content NFT", "STC");
  const contentNFT = await ContentNFT.deployed();
  console.log(`ContentNFT deployed at: ${contentNFT.address}`);

  // 2. 部署 StarToken（构造函数需要：tokenName, tokenSymbol, initialSupply）
  const initialSupply = 1000000; // 初始发行量（100万枚）
  await deployer.deploy(StarToken, "Star Token", "STAR", initialSupply);
  const starToken = await StarToken.deployed();
  console.log(`StarToken deployed at: ${starToken.address}`);
};