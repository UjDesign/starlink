const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// IPFS functionality removed for security - using local storage
const ethers = require('ethers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const ContentNFTABI = require('../build/contracts/ContentNFT.json');
const StarTokenABI = require('../build/contracts/StarToken.json');

// 初始化Express应用
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// IPFS configuration removed - using local file storage for security

// 区块链配置
const PROVIDER_URL = process.env.PROVIDER_URL || 'https://polygon-mumbai.infura.io/v3/YOUR_API_KEY';
const CONTENT_NFT_ADDRESS = process.env.CONTENT_NFT_ADDRESS || '0xYourContentNFTAddress';
const STAR_TOKEN_ADDRESS = process.env.STAR_TOKEN_ADDRESS || '0xYourStarTokenAddress';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your-private-key';

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contentNFTContract = new ethers.Contract(CONTENT_NFT_ADDRESS, ContentNFTABI.abi, signer);
const starTokenContract = new ethers.Contract(STAR_TOKEN_ADDRESS, StarTokenABI.abi, signer);

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/starlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 数据模型
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true },
  walletAddress: String,
  createdAt: { type: Date, default: Date.now },
  starBalance: { type: Number, default: 0 },
  reputation: { type: Number, default: 100 },
  lastActive: Date
});

const ContentSchema = new mongoose.Schema({
  tokenId: Number,
  ipfsHash: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  tags: [String],
  isOriginal: Boolean,
  originalCreator: String,
  royaltyFee: Number,
  likes: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  isFrozen: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Content = mongoose.model('Content', ContentSchema);

// 辅助函数：生成随机钱包地址
const generateWalletAddress = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
};

// API路由
app.post('/api/register', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // 检查用户是否已存在
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 创建新用户
    user = new User({
      phoneNumber,
      walletAddress: generateWalletAddress(),
      lastActive: new Date()
    });

    // 新用户奖励100 STAR
    user.starBalance = 100;

    await user.save();

    res.status(201).json({
      userId: user._id,
      walletAddress: user.walletAddress,
      starBalance: user.starBalance
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/upload-content', upload.single('video'), async (req, res) => {
  try {
    const { title, description, tags, isOriginal, originalCreator, royaltyFee, userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // 简化IPFS上传，使用本地文件路径作为哈希
    // TODO: 实现真实的IPFS上传功能
    const ipfsHash = `local_${Date.now()}_${file.filename}`;

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 调用智能合约铸造NFT
    const tx = await contentNFTContract.mintContent(
      user.walletAddress,
      title,
      ipfsHash,
      'video'
    );

    const receipt = await tx.wait();

    // 从事件中获取tokenId
    let tokenId;
    for (const log of receipt.logs) {
      try {
        const decoded = contentNFTContract.interface.parseLog(log);
        if (decoded.name === 'ContentMinted') {
          tokenId = decoded.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // 忽略不相关的日志
      }
    }

    if (!tokenId) {
      return res.status(500).json({ message: 'Failed to get token ID' });
    }

    // 保存内容信息到数据库
    const content = new Content({
      tokenId,
      ipfsHash,
      creator: user._id,
      title,
      description,
      tags: tags ? tags.split(',') : [],
      isOriginal: isOriginal === 'true',
      originalCreator,
      royaltyFee: royaltyFee || 5
    });

    await content.save();

    // 奖励创作者50 STAR
    user.starBalance += 50;
    await user.save();

    // 清理本地文件
    fs.unlinkSync(file.path);

    res.status(201).json({
      contentId: content._id,
      tokenId,
      ipfsHash,
      starBalance: user.starBalance
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload content' });
  }
});

app.get('/api/content', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 获取内容列表（按创建时间排序）
    const contents = await Content.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'walletAddress');

    const total = await Content.countDocuments();

    res.json({
      contents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Failed to get content' });
  }
});

app.post('/api/like-content', async (req, res) => {
  try {
    const { contentId, userId } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // 增加点赞数
    content.likes += 1;
    await content.save();

    // 奖励用户10 STAR
    const user = await User.findById(userId);
    user.starBalance += 10;
    await user.save();

    res.json({
      likes: content.likes,
      starBalance: user.starBalance
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Failed to like content' });
  }
});

app.post('/api/report-content', async (req, res) => {
  try {
    const { contentId, userId, reason, evidence } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 简化举报逻辑，直接冻结内容
    // TODO: 实现智能合约举报功能
    console.log(`Content ${content.tokenId} reported for: ${reason}`);

    // 更新内容状态
    content.isFrozen = true;
    await content.save();

    res.json({ message: 'Content reported successfully', isFrozen: true });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Failed to report content' });
  }
});

app.post('/api/stake-tokens', async (req, res) => {
  try {
    const { userId, amount, contentId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // 检查余额
    if (user.starBalance < amount) {
      return res.status(400).json({ message: 'Insufficient STAR balance' });
    }

    // 简化质押逻辑，直接扣除余额
    // TODO: 实现智能合约质押功能
    console.log(`User ${userId} staked ${amount} STAR on content ${contentId}`);

    // 更新用户余额
    user.starBalance -= amount;
    await user.save();

    res.json({ message: 'Tokens staked successfully', starBalance: user.starBalance });
  } catch (error) {
    console.error('Stake error:', error);
    res.status(500).json({ message: 'Failed to stake tokens' });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
