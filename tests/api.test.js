const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const User = require('../backend/models/User');
const Content = require('../backend/models/Content');
const { ethers } = require('ethers');

// 模拟区块链合约
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getBlockNumber: jest.fn().mockResolvedValue(1),
      getBlock: jest.fn().mockResolvedValue({ timestamp: 123456789 })
    }))
  },
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0xMockWalletAddress',
    signMessage: jest.fn().mockResolvedValue('0xMockSignature')
  }))
}));

describe('API Endpoints', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/starlink-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 测试前清理数据
    await User.deleteMany({});
    await Content.deleteMany({});
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ phoneNumber: '1234567890' })
        .expect(201);

      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('walletAddress');
      expect(response.body.starBalance).toBe(100);

      // 检查数据库
      const user = await User.findOne({ phoneNumber: '1234567890' });
      expect(user).not.toBeNull();
      expect(user.starBalance).toBe(100);
    });

    it('should not register a user with existing phone number', async () => {
      // 先创建一个用户
      await User.create({
        phoneNumber: '1234567890',
        walletAddress: '0xTestAddress1',
        starBalance: 100
      });

      // 尝试用相同手机号注册
      const response = await request(app)
        .post('/api/register')
        .send({ phoneNumber: '1234567890' })
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/upload-content', () => {
    let userId;

    beforeEach(async () => {
      // 创建测试用户
      const user = await User.create({
        phoneNumber: '1234567890',
        walletAddress: '0xTestAddress1',
        starBalance: 100
      });
      userId = user._id;
    });

    it('should upload content successfully', async () => {
      // 使用supertest上传文件
      const response = await request(app)
        .post('/api/upload-content')
        .field('title', 'Test Video')
        .field('description', 'This is a test video')
        .field('tags', 'test,video')
        .field('isOriginal', 'true')
        .field('royaltyFee', '5')
        .field('userId', userId.toString())
        .attach('video', './tests/test-video.mp4')
        .expect(201);

      expect(response.body).toHaveProperty('contentId');
      expect(response.body).toHaveProperty('tokenId');
      expect(response.body).toHaveProperty('ipfsHash');
      
      // 检查用户STAR余额增加
      const user = await User.findById(userId);
      expect(user.starBalance).toBe(150); // 初始100 + 奖励50

      // 检查内容是否保存
      const content = await Content.findById(response.body.contentId);
      expect(content).not.toBeNull();
      expect(content.title).toBe('Test Video');
      expect(content.creator.toString()).toBe(userId.toString());
    });

    it('should return error when no video is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload-content')
        .field('title', 'Test Video')
        .field('userId', userId.toString())
        .expect(400);

      expect(response.body.message).toBe('No video file uploaded');
    });
  });

  describe('GET /api/content', () => {
    beforeEach(async () => {
      // 创建测试用户
      const user = await User.create({
        phoneNumber: '1234567890',
        walletAddress: '0xTestAddress1',
        starBalance: 100
      });

      // 创建测试内容
      for (let i = 0; i < 15; i++) {
        await Content.create({
          tokenId: i,
          ipfsHash: `QmTestHash${i}`,
          creator: user._id,
          title: `Test Content ${i}`,
          description: `Description ${i}`,
          tags: ['test', `tag${i % 3}`],
          isOriginal: true,
          royaltyFee: 5,
          likes: i * 10
        });
      }
    });

    it('should get content with pagination', async () => {
      const response = await request(app)
        .get('/api/content?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('contents');
      expect(response.body.contents.length).toBe(10);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.total).toBe(15);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should get second page of content', async () => {
      const response = await request(app)
        .get('/api/content?page=2&limit=10')
        .expect(200);

      expect(response.body.contents.length).toBe(5);
      expect(response.body.pagination.page).toBe(2);
    });
  });

  describe('POST /api/like-content', () => {
    let userId;
    let contentId;

    beforeEach(async () => {
      // 创建测试用户
      const user = await User.create({
        phoneNumber: '1234567890',
        walletAddress: '0xTestAddress1',
        starBalance: 100
      });
      userId = user._id;

      // 创建测试内容
      const content = await Content.create({
        tokenId: 1,
        ipfsHash: 'QmTestHash1',
        creator: user._id,
        title: 'Test Content',
        description: 'Description',
        tags: ['test'],
        isOriginal: true,
        royaltyFee: 5,
        likes: 10
      });
      contentId = content._id;
    });

    it('should like content successfully', async () => {
      const response = await request(app)
        .post('/api/like-content')
        .send({ contentId: contentId.toString(), userId: userId.toString() })
        .expect(200);

      expect(response.body.likes).toBe(11);
      expect(response.body.starBalance).toBe(110); // 初始100 + 奖励10

      // 检查数据库更新
      const content = await Content.findById(contentId);
      expect(content.likes).toBe(11);

      const user = await User.findById(userId);
      expect(user.starBalance).toBe(110);
    });
  });
});
    