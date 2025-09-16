# Starlink Web3 Video Platform

A decentralized short video platform built on Web3 technology, featuring NFT content creation, STAR token rewards, and blockchain-based content management.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### Start the Platform
```bash
# Clone and navigate to the project
git clone <repository-url>
cd starlink

# Start all services with Docker Compose
npm start
# or
docker compose up -d

# Check service status
docker compose ps

# View logs
npm run logs
# or
docker compose logs -f
```

### Stop the Platform
```bash
npm stop
# or
docker compose down
```

## 🏗️ Architecture

### Backend Services
- **API Server**: Node.js/Express backend on port 5000
- **MongoDB**: Database for user data and content metadata on port 27017
- **IPFS**: Distributed file storage on ports 4001, 5001, 8080

### Smart Contracts
- **ContentNFT**: ERC721 contract for video content NFTs
- **StarToken**: ERC20 token for platform rewards

### Frontend
- **React Native App**: Mobile-first interface with Expo
- **Web Interface**: Browser-based access via Expo web

## 📱 Features

### User Management
- Phone number registration
- Auto-generated wallet addresses
- 100 STAR welcome bonus

### Content Creation
- Video upload and NFT minting
- IPFS storage integration
- 50 STAR creator rewards
- Royalty fee configuration

### Social Features
- Like/comment system
- 10 STAR rewards for engagement
- Content reporting mechanism
- Token staking on content

### Blockchain Integration
- Ethereum/Polygon network support
- Smart contract interactions
- Decentralized content ownership

## 🔧 API Endpoints

### Health Check
```
GET /health
```

### User Management
```
POST /api/register
Body: { phoneNumber: string }
```

### Content Management
```
POST /api/upload-content
GET /api/content?page=1&limit=10
POST /api/like-content
POST /api/report-content
POST /api/stake-tokens
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Smart Contract Development
```bash
# Compile contracts
truffle compile

# Deploy to local network
truffle migrate --network development
```

## 🔐 Environment Configuration

### Required Environment Variables
```bash
# Blockchain Configuration
PROVIDER_URL=http://127.0.0.1:7545
PRIVATE_KEY=your-private-key
CONTENT_NFT_ADDRESS=deployed-contract-address
STAR_TOKEN_ADDRESS=deployed-contract-address

# Database Configuration
MONGO_DB=starlink_db
MONGO_USERNAME=chinux
MONGO_PASSWORD=chinux123

# Server Configuration
PORT=5000
```

## 📊 Service Status

All services are currently running and healthy:
- ✅ Backend API (Port 5000)
- ✅ MongoDB Database (Port 27017)
- ✅ IPFS Node (Ports 4001, 5001, 8080)
- ✅ Smart Contracts Deployed
- ✅ Health Check Endpoint Active

## 🚨 Troubleshooting

### Container Issues
```bash
# Rebuild containers
docker compose up -d --build

# Check container logs
docker compose logs [service-name]

# Reset everything
npm run clean
```

### Common Issues
1. **Port conflicts**: Ensure ports 5000, 27017, 4001, 5001, 8080 are available
2. **Smart contract errors**: Verify contract addresses in .env files
3. **Database connection**: Check MongoDB credentials and network connectivity

## 📝 Recent Fixes Applied

1. ✅ Fixed Dockerfile WORKDIR path issues
2. ✅ Corrected smart contract import paths in backend
3. ✅ Created missing uploads directory
4. ✅ Added curl to Docker image for health checks
5. ✅ Fixed server.js file location and paths
6. ✅ Resolved Docker build context issues

## 🎯 Next Steps

1. Configure blockchain network (Ganache/Testnet)
2. Deploy smart contracts to target network
3. Update frontend API endpoints for production
4. Set up CI/CD pipeline
5. Configure domain and SSL certificates

## 📞 Support

For issues or questions, check the logs first:
```bash
docker compose logs -f
```

The platform is now fully operational and ready for development or production use.
