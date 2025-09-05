const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContentNFT and StarToken", function () {
  let ContentNFT;
  let contentNFT;
  let StarToken;
  let starToken;
  let owner;
  let user1;
  let user2;
  let treasury;
  
  beforeEach(async function () {
    // 获取签名者
    [owner, user1, user2, treasury] = await ethers.getSigners();
    
    // 部署合约
    ContentNFT = await ethers.getContractFactory("ContentNFT");
    contentNFT = await ContentNFT.deploy(treasury.address);
    await contentNFT.deployed();
    
    StarToken = await ethers.getContractFactory("StarToken");
    starToken = await StarToken.deploy(treasury.address);
    await starToken.deployed();
    
    // 转账一些代币给用户
    await starToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await starToken.transfer(user2.address, ethers.utils.parseEther("1000"));
  });
  
  describe("ContentNFT", function () {
    it("Should mint a new content NFT", async function () {
      const ipfsHash = "QmTestHash123";
      const royaltyFee = 5;
      
      // 铸造NFT
      await expect(contentNFT.connect(user1).mintContent(ipfsHash, royaltyFee, true, ethers.constants.AddressZero))
        .to.emit(contentNFT, "ContentCreated")
        .withArgs(0, user1.address, ipfsHash, true, await getBlockTimestamp());
      
      // 检查所有权
      expect(await contentNFT.ownerOf(0)).to.equal(user1.address);
      
      // 检查元数据
      const metadata = await contentNFT.getContentMetadata(0);
      expect(metadata.ipfsHash).to.equal(ipfsHash);
      expect(metadata.royaltyFee).to.equal(royaltyFee);
      expect(metadata.creator).to.equal(user1.address);
      expect(metadata.isOriginal).to.equal(true);
    });
    
    it("Should allow reporting content", async function () {
      // 先铸造一个NFT
      await contentNFT.connect(user1).mintContent("QmTestHash123", 5, true, ethers.constants.AddressZero);
      
      // 举报内容
      const reason = "Copyright infringement";
      const evidence = "https://example.com/evidence.jpg";
      
      await expect(contentNFT.connect(user2).reportContent(0, reason, evidence))
        .to.emit(contentNFT, "ContentReported")
        .withArgs(0, user2.address, reason);
      
      // 检查内容是否被冻结
      expect(await contentNFT.isContentFrozen(0)).to.equal(true);
      
      // 检查举报记录
      const report = await contentNFT.tokenReports(0, 0);
      expect(report.reporter).to.equal(user2.address);
      expect(report.reason).to.equal(reason);
      expect(report.evidence).to.equal(evidence);
      expect(report.resolved).to.equal(false);
    });
    
    it("Should allow resolving reports", async function () {
      // 先铸造一个NFT并举报
      await contentNFT.connect(user1).mintContent("QmTestHash123", 5, true, ethers.constants.AddressZero);
      await contentNFT.connect(user2).reportContent(0, "Copyright infringement", "https://example.com/evidence.jpg");
      
      // 解决举报
      await expect(contentNFT.resolveReport(0, 0, false))
        .to.emit(contentNFT, "ReportResolved")
        .withArgs(0, false, owner.address);
      
      // 检查举报状态
      const report = await contentNFT.tokenReports(0, 0);
      expect(report.resolved).to.equal(true);
      expect(report.valid).to.equal(false);
      
      // 检查内容是否被解冻
      expect(await contentNFT.isContentFrozen(0)).to.equal(false);
    });
  });
  
  describe("StarToken", function () {
    it("Should allow staking tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      const contentId = 1;
      
      // 批准代币转账
      await starToken.connect(user1).approve(starToken.address, amount);
      
      // 质押代币
      await expect(starToken.connect(user1).stake(amount, contentId))
        .to.emit(starToken, "Staked")
        .withArgs(user1.address, amount, contentId);
      
      // 检查质押记录
      expect(await starToken.getUserStakeCount(user1.address)).to.equal(1);
      const stake = await starToken.userStakes(user1.address, 0);
      expect(stake.amount).to.equal(amount);
      expect(stake.contentId).to.equal(contentId);
    });
    
    it("Should allow unstaking tokens after 24 hours", async function () {
      const amount = ethers.utils.parseEther("100");
      const contentId = 1;
      
      // 质押代币
      await starToken.connect(user1).approve(starToken.address, amount);
      await starToken.connect(user1).stake(amount, contentId);
      
      // 快进时间24小时
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      // 解除质押
      await expect(starToken.connect(user1).unstake(0))
        .to.emit(starToken, "Unstaked")
        .withArgs(user1.address, amount, contentId);
      
      // 检查质押记录
      expect(await starToken.getUserStakeCount(user1.address)).to.equal(0);
    });
    
    it("Should allow distributing rewards", async function () {
      const amount = ethers.utils.parseEther("50");
      
      // 分发奖励
      await expect(starToken.distributeReward(user1.address, amount))
        .to.emit(starToken, "RewardDistributed")
        .withArgs(user1.address, amount);
      
      // 检查余额
      expect(await starToken.balanceOf(user1.address)).to.equal(
        ethers.utils.parseEther("1050") // 初始1000 + 奖励50
      );
    });
  });
  
  // 辅助函数：获取当前区块时间戳
  async function getBlockTimestamp() {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    return block.timestamp;
  }
});
    