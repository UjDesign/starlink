# Starlink Backend API

## Overview
This is the backend API for the Starlink Web3 short video platform. It provides RESTful endpoints for user management, content upload, NFT minting, and token operations.

## Features
- User registration with auto-generated wallet addresses
- Video content upload and local storage
- NFT minting integration with smart contracts
- STAR token reward system
- Content interaction (likes, comments)
- Content reporting and moderation
- Token staking functionality

## API Endpoints

### Health Check
- `GET /health` - Server health status

### User Management
- `POST /api/register` - Register new user with phone number
  - Body: `{ "phoneNumber": "string" }`
  - Returns: `{ "userId": "string", "walletAddress": "string", "starBalance": number }`

### Content Management
- `POST /api/upload-content` - Upload video content
  - Form data: `video` (file), `title`, `description`, `tags`, `isOriginal`, `userId`
  - Returns: `{ "contentId": "string", "tokenId": "string", "ipfsHash": "string", "starBalance": number }`

- `GET /api/content` - Get content list with pagination
  - Query: `page`, `limit`
  - Returns: `{ "contents": [], "pagination": {} }`

### Interactions
- `POST /api/like-content` - Like content
  - Body: `{ "contentId": "string", "userId": "string" }`
  - Returns: `{ "likes": number, "starBalance": number }`

- `POST /api/report-content` - Report inappropriate content
  - Body: `{ "contentId": "string", "userId": "string", "reason": "string", "evidence": "string" }`
  - Returns: `{ "message": "string", "isFrozen": boolean }`

### Token Operations
- `POST /api/stake-tokens` - Stake STAR tokens on content
  - Body: `{ "userId": "string", "amount": number, "contentId": "string" }`
  - Returns: `{ "message": "string", "starBalance": number }`

## Environment Variables
```
CONTENT_NFT_ADDRESS=0x5B9DA703a39CD6Cd45C1C47701a27924edCC3b7F
STAR_TOKEN_ADDRESS=0xd4C72277546E176fDc839A422c1c7d6b019e3F4D
PROVIDER_URL=http://127.0.0.1:7545
PRIVATE_KEY=0xc4587e12d1d5336d606d7eaaae127d3c16fedef53a618862886a2574ef5ac4a1
MONGODB_URI=mongodb://chinux:chinux123@localhost:27017/starlink_db?authSource=admin
PORT=5000
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Create uploads directory:
```bash
mkdir -p uploads
```

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Database Schema

### User Model
```javascript
{
  phoneNumber: String (unique),
  walletAddress: String,
  createdAt: Date,
  starBalance: Number (default: 0),
  reputation: Number (default: 100),
  lastActive: Date
}
```

### Content Model
```javascript
{
  tokenId: Number,
  ipfsHash: String,
  creator: ObjectId (ref: User),
  title: String,
  description: String,
  tags: [String],
  isOriginal: Boolean,
  originalCreator: String,
  royaltyFee: Number,
  likes: Number (default: 0),
  comments: [{
    user: ObjectId (ref: User),
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  isFrozen: Boolean (default: false)
}
```

## Reward System
- New user registration: 100 STAR tokens
- Content upload: 50 STAR tokens
- Content like: 10 STAR tokens

## Security Notes
- IPFS integration temporarily disabled for security
- Using local file storage for uploaded content
- All smart contract interactions are simplified for development
- MongoDB warnings about deprecated options are expected

## Docker Support
The backend includes a Dockerfile for containerized deployment:
```bash
docker build -t starlink-backend .
docker run -p 5000:5000 starlink-backend
```
