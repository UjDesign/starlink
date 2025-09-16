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

### 🔐 Authentication & User Management
- **Phone-based Registration**: Simple phone number signup with automatic wallet generation
- **Auto-generated Wallets**: Each user gets a unique Ethereum wallet address
- **Welcome Bonus**: 100 STAR tokens awarded upon successful registration
- **Secure Login**: Persistent authentication with AuthContext integration
- **User Profiles**: Display wallet address, STAR balance, and user statistics

### 🎥 Video Content Creation
- **Video Upload**: Native video picker with permission handling
- **NFT Minting**: Automatic NFT creation for uploaded videos
- **IPFS Storage**: Decentralized video storage on IPFS network
- **Creator Rewards**: 50 STAR tokens earned per video upload
- **Content Metadata**: Title, description, tags, and royalty fee configuration
- **Upload Progress**: Real-time upload status with loading indicators

### 🎬 Video Playback & Discovery
- **Video Feed**: Infinite scroll feed of all platform videos
- **Native Video Player**: Expo AV integration with native controls
- **Video Information**: Creator details, like counts, and descriptions
- **Content Statistics**: View counts, engagement metrics, and timestamps
- **Responsive Design**: Optimized for mobile and web viewing

### 💫 Social Features & Engagement
- **Like System**: Heart videos and earn 10 STAR tokens per like given
- **Content Reporting**: Flag inappropriate content with moderation system
- **Social Interactions**: Share videos and engage with creators
- **Engagement Rewards**: Token incentives for platform participation
- **Community Features**: User interaction tracking and social metrics

### 🪙 STAR Token Economy
- **Welcome Bonus**: 100 STAR tokens for new users
- **Upload Rewards**: 50 STAR tokens per video upload
- **Engagement Rewards**: 10 STAR tokens per like given
- **Token Staking**: Stake tokens on content for additional rewards
- **Balance Tracking**: Real-time STAR token balance display
- **Reward Notifications**: Instant feedback on token earnings

### 🔗 Blockchain Integration
- **Smart Contracts**: ContentNFT (ERC721) and StarToken (ERC20)
- **Ethereum/Polygon Support**: Multi-network blockchain compatibility
- **Decentralized Ownership**: True content ownership through NFTs
- **Web3 Interactions**: Direct smart contract integration
- **Wallet Integration**: Seamless blockchain transaction handling

### 📱 Modern Mobile Experience
- **React Native**: Cross-platform mobile app with Expo
- **Expo Router**: Modern navigation with file-based routing
- **TypeScript**: Full type safety and developer experience
- **Responsive UI**: Beautiful, modern interface with consistent styling
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth UX with proper loading indicators

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

### Frontend Development (StarlinkRN)
```bash
cd StarlinkRN
npm install
npx expo start

# For web development
npx expo start --web

# For mobile development
npx expo start --tunnel
```

### Legacy Frontend (Deprecated)
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

## 📝 Recent Migration & Fixes Applied

### ✅ Complete Frontend Migration (Latest)
1. **Feature Migration**: Successfully migrated all features from legacy `frontend/` to modern `StarlinkRN/`
2. **Authentication System**: Implemented phone-based registration with STAR token rewards
3. **Video Upload**: Created comprehensive upload component with NFT minting integration
4. **Video Playback**: Added native video player with social features (like, report, share)
5. **Profile Management**: Enhanced user profile with stats, content listing, and wallet info
6. **UI/UX Improvements**: Modern React Native design with consistent styling and error handling
7. **TypeScript Integration**: Full type safety with proper interfaces and error handling
8. **API Integration**: Connected all frontend components to backend API endpoints

### ✅ Backend Infrastructure Fixes
1. **Docker Configuration**: Fixed Dockerfile WORKDIR path issues and build context
2. **Smart Contract Integration**: Corrected contract import paths and ABI access
3. **File Upload System**: Created missing uploads directory with proper permissions
4. **Health Monitoring**: Added curl to Docker image for health checks
5. **Environment Setup**: Proper .env configuration and variable loading
6. **Security Updates**: Removed vulnerable dependencies and improved error handling

### ✅ Platform Stability
1. **All Services Running**: Backend API, MongoDB, IPFS nodes operational
2. **Smart Contracts Deployed**: ContentNFT and StarToken contracts active
3. **Frontend Accessible**: StarlinkRN app running on web and mobile
4. **API Endpoints Tested**: All major endpoints responding correctly
5. **Token Economy Active**: STAR token rewards system fully functional

## 🎯 Platform Status

### ✅ Fully Operational Features
- **User Registration & Authentication** - Phone-based signup with wallet generation
- **Video Upload & NFT Minting** - Complete content creation pipeline
- **Video Playback & Discovery** - Native video player with social features
- **STAR Token Rewards** - 100 welcome + 50 upload + 10 like rewards
- **Profile Management** - User stats, content listing, wallet display
- **Social Interactions** - Like, report, and engagement systems

### 🚀 Ready for Production
The platform is now feature-complete and ready for:
1. Production deployment configuration
2. Blockchain network selection (Mainnet/Polygon)
3. Domain and SSL certificate setup
4. CI/CD pipeline implementation
5. User onboarding and marketing

## 📞 Support

For issues or questions, check the logs first:
```bash
docker compose logs -f
```

The platform is now fully operational and ready for development or production use.
