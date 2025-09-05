#!/bin/bash

# 部署脚本：自动化部署星链MVP应用

# 错误处理
set -e

# 配置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# 检查环境变量
check_env() {
  if [ -z "$1" ]; then
    echo -e "${RED}错误: 请设置环境变量 $2${NC}"
    exit 1
  fi
}

# 显示信息
info() {
  echo -e "${YELLOW}>> $1${NC}"
}

# 显示成功信息
success() {
  echo -e "${GREEN}>> $1${NC}"
}

# 显示错误信息
error() {
  echo -e "${RED}>> $1${NC}"
  exit 1
}

# 主部署流程
main() {
  info "开始部署星链MVP应用..."

  # 检查必要的工具
  info "检查必要的工具..."
  if ! command -v docker &> /dev/null; then
    error "未找到docker，请安装docker"
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    error "未找到docker-compose，请安装docker-compose"
  fi
  
  if ! command -v truffle &> /dev/null; then
    error "未找到truffle，请安装truffle: npm install -g truffle"
  fi
  
  if ! command -v npm &> /dev/null; then
    error "未找到npm，请安装Node.js和npm"
  fi

  # 检查环境变量
  info "检查环境变量..."
  check_env "$PROVIDER_URL" "PROVIDER_URL"
  check_env "$PRIVATE_KEY" "PRIVATE_KEY"
  check_env "$MONGO_USERNAME" "MONGO_USERNAME"
  check_env "$MONGO_PASSWORD" "MONGO_PASSWORD"

  # 编译智能合约
  info "编译智能合约..."
  cd contracts || error "找不到contracts目录"
  npm install
  truffle compile || error "智能合约编译失败"
  
  # 部署智能合约到测试网
  info "部署智能合约到测试网..."
  truffle migrate --network mumbai || error "智能合约部署失败"
  
  # 提取合约地址并设置到环境变量
  info "提取合约地址..."
  CONTENT_NFT_ADDRESS=$(cat build/contracts/ContentNFT.json | jq -r '.networks."80001".address')
  STAR_TOKEN_ADDRESS=$(cat build/contracts/StarToken.json | jq -r '.networks."80001".address')
  
  check_env "$CONTENT_NFT_ADDRESS" "CONTENT_NFT_ADDRESS"
  check_env "$STAR_TOKEN_ADDRESS" "STAR_TOKEN_ADDRESS"
  
  echo "CONTENT_NFT_ADDRESS=$CONTENT_NFT_ADDRESS" >> .env
  echo "STAR_TOKEN_ADDRESS=$STAR_TOKEN_ADDRESS" >> .env
  
  success "智能合约部署成功"
  echo "ContentNFT地址: $CONTENT_NFT_ADDRESS"
  echo "StarToken地址: $STAR_TOKEN_ADDRESS"
  
  # 准备后端环境
  info "准备后端环境..."
  cd ../backend || error "找不到backend目录"
  npm install || error "后端依赖安装失败"
  
  # 复制环境变量
  cp ../contracts/.env .env || error "复制环境变量失败"
  
  # 准备前端环境
  info "准备前端环境..."
  cd ../frontend || error "找不到frontend目录"
  npm install || error "前端依赖安装失败"
  
  # 使用docker-compose启动服务
  info "启动服务..."
  cd .. || error "回到根目录失败"
  docker-compose up -d || error "启动服务失败"
  
  success "所有服务启动成功！"
  echo "后端API: http://localhost:5000"
  echo "IPFS网关: http://localhost:8080/ipfs/"
  echo "MongoDB: localhost:27017"
}

# 运行主流程
main
    