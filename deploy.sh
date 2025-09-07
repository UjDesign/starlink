#!/bin/zsh

# 星链MVP部署脚本（兼容最新Docker和Node.js版本）
# 修复：依赖安装循环、环境变量加载、命令兼容性

set -e  # 错误立即退出

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查环境变量是否存在
check_env() {
  if [[ -z "$1" ]]; then
    echo -e "${RED}错误: 请设置环境变量 $2${NC}"
    exit 1
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

  # 1. 加载.env文件（关键修复：确保变量正确加载）
  if [[ -f ".env" ]]; then
    info "加载 .env 文件中的环境变量..."
    # 只导出非注释、非空行的变量（避免特殊字符问题）
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
  else
    error "未找到 .env 文件，请先创建（参考 .env.example）"
  fi

  # 2. 检查核心工具版本
  info "当前Node.js版本: $(node -v)"
  info "当前npm版本: $(npm -v)"
  info "当前truffle版本: $(truffle version | head -n 1)"
  info "当前docker compose版本: $(docker compose version | head -n 1)"

  # 3. 加载系统环境配置
  info "加载系统环境配置..."
  [[ -f ~/.zshrc ]] && source ~/.zshrc

  # 4. 检查系统依赖
  info "检查系统依赖..."
  local tools=("docker" "docker compose" "truffle" "npm" "jq")
  for tool in "${tools[@]}"; do
    if ! command -v ${tool%% *} &> /dev/null; then  # 处理带空格的命令
      error "未找到工具 $tool，请先安装"
    fi
  done

  # 5. 验证必要环境变量
  info "验证必要环境变量..."
  check_env "$PROVIDER_URL" "PROVIDER_URL"
  check_env "$PRIVATE_KEY" "PRIVATE_KEY"
  check_env "$MONGO_USERNAME" "MONGO_USERNAME"
  check_env "$MONGO_PASSWORD" "MONGO_PASSWORD"

  # 6. 安装项目依赖（关键修复：分步安装，避免循环）
  info "安装项目依赖（确保版本兼容）..."
  
  # 安装contracts依赖
  if [[ ! -d "contracts/node_modules" ]]; then
    info "安装合约依赖..."
    cd contracts || error "进入contracts目录失败"
    npm install --no-optional || error "合约依赖安装失败"
    cd .. || error "返回根目录失败"
  else
    info "合约依赖已存在，跳过安装"
  fi

  # 安装backend依赖
  if [[ ! -d "backend/node_modules" ]]; then
    info "安装后端依赖..."
    cd backend || error "进入backend目录失败"
    npm install --no-optional || error "后端依赖安装失败"
    cd .. || error "返回根目录失败"
  else
    info "后端依赖已存在，跳过安装"
  fi

  # 安装frontend依赖
  if [[ ! -d "frontend/node_modules" ]]; then
    info "安装前端依赖..."
    cd frontend || error "进入frontend目录失败"
    npm install --no-optional || error "前端依赖安装失败"
    cd .. || error "返回根目录失败"
  else
    info "前端依赖已存在，跳过安装"
  fi

  # 7. 编译智能合约
  info "编译智能合约（Solidity 0.8.24 + OpenZeppelin 5.4.0）..."
  cd contracts || error "进入contracts目录失败"
  truffle compile || error "合约编译失败"
  cd .. || error "返回根目录失败"

  # 8. 部署智能合约到Polygon amoy
    # 在deploy.sh中“部署合约到Polygon amoy测试网...”后添加：
  info "部署合约到Polygon amoy测试网...（日志将保存到 deploy_error.log）"
  # 执行Truffle迁移，并将输出保存到临时文件（用于提取地址）
  if ! truffle migrate --network amoy 2>&1 | tee deploy_error.log; then
    error "合约部署失败！详细日志见 deploy_error.log"
    # 输出日志前10行，快速提示关键错误
    echo -e "\n=== 部署错误日志（前10行）==="
    head -n 10 deploy_error.log
    exit 1  # 退出脚本，避免继续执行后续步骤
  fi

  # 提取ContentNFT合约地址（需根据你的迁移脚本文件名调整，如2_deploy_contracts.js）
  CONTENT_NFT_ADDR=$(grep -A1 "ContentNFT deployed at" migrate_output.txt | grep -o '0x[0-9a-fA-F]*')
  # 提取StarToken合约地址
  STAR_TOKEN_ADDR=$(grep -A1 "StarToken deployed at" migrate_output.txt | grep -o '0x[0-9a-fA-F]*')

  # 验证地址是否提取成功
  if [[ -z $CONTENT_NFT_ADDR || -z $STAR_TOKEN_ADDR ]]; then
    error "未成功提取合约地址，请检查迁移脚本输出"
  fi

  # 将地址写入.env文件（覆盖原有空值）
  sed -i '' "s|^CONTENT_NFT_ADDRESS=.*|CONTENT_NFT_ADDRESS=$CONTENT_NFT_ADDR|" .env  # macOS
  sed -i '' "s|^STAR_TOKEN_ADDRESS=.*|STAR_TOKEN_ADDRESS=$STAR_TOKEN_ADDR|" .env      # macOS
  # 若为Linux，将sed命令中的 '' 去掉：sed -i "s|^CONTENT_NFT_ADDRESS=.*|..." .env

  info "合约地址已写入.env：ContentNFT=$CONTENT_NFT_ADDR，StarToken=$STAR_TOKEN_ADDR"

  # 删除临时输出文件
  rm -f migrate_output.txt


  # 9. 启动服务（使用docker compose v2）
  info "启动所有服务（docker compose）..."
  docker compose up -d || error "服务启动失败"

  success "部署完成！"
  echo "后端API: http://localhost:5000"
  echo "前端应用: http://localhost:3000"
  echo "合约地址: ContentNFT=$CONTENT_NFT_ADDRESS, StarToken=$STAR_TOKEN_ADDRESS"
}

# 执行主流程
main
    