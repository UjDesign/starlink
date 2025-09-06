#!/bin/zsh

# 星链MVP部署脚本（兼容最新版本）
# 自动检查依赖、安装缺失库、处理版本兼容

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 环境变量检查函数
check_env() {
  if [[ -z "$1" ]]; then
    echo -e "${RED}错误: 请设置环境变量 $2${NC}"
    exit 1
  fi
}

# 依赖检查函数
check_dependency() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${YELLOW}检测到缺失依赖 $1，正在安装...${NC}"
    case $1 in
      "docker")
        brew install docker
        ;;
      "docker-compose")
        brew install docker-compose
        ;;
      "node")
        brew install node@20
        echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
        source ~/.zshrc
        ;;
      "npm")
        brew install npm
        ;;
      "truffle")
        npm install -g truffle
        ;;
      "jq")
        brew install jq
        ;;
      *)
        echo -e "${RED}无法自动安装依赖 $1，请手动安装${NC}"
        exit 1
        ;;
    esac
  fi
}

# 信息提示
info() {
  echo -e "${YELLOW}>> $1${NC}"
}

# 成功提示
success() {
  echo -e "${GREEN}>> $1${NC}"
}

# 错误提示
error() {
  echo -e "${RED}>> $1${NC}"
  exit 1
}

# 主部署流程
main() {
  info "星链MVP部署启动（兼容最新版本）"
  info "当前Node.js版本: $(node -v)"
  info "当前npm版本: $(npm -v)"

  # 加载环境配置
  info "加载系统环境配置..."
  [[ -f ~/.zshrc ]] && source ~/.zshrc

  # 检查基础依赖
  info "检查系统依赖..."
  local dependencies=("docker" "docker-compose" "node" "npm" "truffle" "jq")
  for dep in "${dependencies[@]}"; do
    check_dependency $dep
  done

  # 检查环境变量
  info "验证必要环境变量..."
  check_env "$PROVIDER_URL" "PROVIDER_URL"
  check_env "$PRIVATE_KEY" "PRIVATE_KEY"
  check_env "$MONGO_USERNAME" "MONGO_USERNAME"
  check_env "$MONGO_PASSWORD" "MONGO_PASSWORD"

  # 创建.env文件（如果不存在）
  [[ ! -f .env ]] && touch .env
  echo "PROVIDER_URL=$PROVIDER_URL" > .env
  echo "PRIVATE_KEY=$PRIVATE_KEY" >> .env
  echo "MONGO_USERNAME=$MONGO_USERNAME" >> .env
  echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> .env

  # 安装项目依赖
  info "安装项目依赖（确保版本兼容）..."
  npm install

  # 编译并部署智能合约
  info "处理智能合约..."
  cd contracts || error "进入contracts目录失败"
  
  # 确保OpenZeppelin 5.4.0已安装
  if [[ ! -d "node_modules/@openzeppelin/contracts" ]]; then
    info "安装OpenZeppelin Contracts 5.4.0..."
    npm install @openzeppelin/contracts@5.4.0
  fi
  
  # 编译合约
  info "编译智能合约（Solidity 0.8.24）..."
  npx truffle compile || error "合约编译失败"
  
  # 部署合约
  info "部署合约到Polygon Mumbai测试网..."
  npx truffle migrate --network mumbai || error "合约部署失败"
  
  # 提取合约地址
  info "获取合约地址..."
  local CONTENT_NFT_ADDRESS=$(jq -r '.networks."80001".address' build/contracts/ContentNFT.json)
  local STAR_TOKEN_ADDRESS=$(jq -r '.networks."80001".address' build/contracts/StarToken.json)
  
  check_env "$CONTENT_NFT_ADDRESS" "CONTENT_NFT_ADDRESS"
  check_env "$STAR_TOKEN_ADDRESS" "STAR_TOKEN_ADDRESS"
  
  # 更新环境变量
  echo "CONTENT_NFT_ADDRESS=$CONTENT_NFT_ADDRESS" >> .env
  echo "STAR_TOKEN_ADDRESS=$STAR_TOKEN_ADDRESS" >> .env
  cp .env ../backend/.env || error "复制环境变量到后端失败"
  cp .env ../frontend/.env || error "复制环境变量到前端失败"
  
  success "合约部署完成"
  echo "ContentNFT: $CONTENT_NFT_ADDRESS"
  echo "StarToken: $STAR_TOKEN_ADDRESS"

  # 启动服务
  info "启动所有服务..."
  cd .. || error "返回根目录失败"
  docker-compose up -d || error "服务启动失败"

  success "星链MVP部署成功！"
  echo "服务状态："
  docker-compose ps
  echo "后端API: http://localhost:5000"
  echo "前端应用: http://localhost:3000"
}

# 执行主流程
main
    