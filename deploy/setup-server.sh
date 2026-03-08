#!/bin/bash

# 拼豆豆后端服务器自动配置脚本
# 适用于腾讯云轻量应用服务器（Docker CE镜像）
# 作者：AI Assistant
# 日期：2026-03-08

set -e  # 遇到错误立即停止

echo "======================================"
echo "   拼豆豆后端服务器自动配置脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}错误：此脚本必须以 root 用户运行${NC}"
   exit 1
fi

echo -e "${GREEN}[1/8] 更新系统包...${NC}"
apt-get update -y
apt-get upgrade -y

echo -e "${GREEN}[2/8] 安装必要工具...${NC}"
apt-get install -y curl wget git vim htop net-tools

echo -e "${GREEN}[3/8] 验证 Docker 安装...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker 未安装，正在安装...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
else
    echo -e "${GREEN}✓ Docker 已安装${NC}"
fi

echo -e "${GREEN}[4/8] 安装 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
fi
docker-compose --version

echo -e "${GREEN}[5/8] 创建项目目录...${NC}"
mkdir -p /opt/pindoudou
cd /opt/pindoudou

echo -e "${GREEN}[6/8] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    echo "y" | ufw enable || true
fi

echo -e "${GREEN}[7/8] 创建 Docker Compose 配置...${NC}"
cat > docker-compose.yml <<'COMPOSE'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: pindoudou-db
    restart: always
    environment:
      POSTGRES_DB: pindoudou
      POSTGRES_USER: pindoudou
      POSTGRES_PASSWORD: ${DB_PASSWORD:-pindoudou2026}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pindoudou"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存（可选）
  redis:
    image: redis:7-alpine
    container_name: pindoudou-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis2026}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 后端 API（稍后部署）
  # api:
  #   image: pindoudou-api:latest
  #   container_name: pindoudou-api
  #   restart: always
  #   environment:
  #     NODE_ENV: production
  #     DATABASE_URL: postgresql://pindoudou:${DB_PASSWORD:-pindoudou2026}@postgres:5432/pindoudou
  #     REDIS_URL: redis://:${REDIS_PASSWORD:-redis2026}@redis:6379
  #     JWT_SECRET: ${JWT_SECRET}
  #   ports:
  #     - "3000:3000"
  #   depends_on:
  #     - postgres
  #     - redis

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: pindoudou-network
COMPOSE

echo -e "${GREEN}[8/8] 创建环境变量文件...${NC}"
cat > .env <<ENV
# 数据库密码（请修改为强密码）
DB_PASSWORD=pindoudou2026

# Redis 密码（请修改为强密码）
REDIS_PASSWORD=redis2026

# JWT 密钥（请生成随机字符串）
JWT_SECRET=$(openssl rand -base64 32)

# 服务器配置
PORT=3000
NODE_ENV=production
ENV

echo ""
echo -e "${GREEN}======================================"
echo "   ✓ 服务器配置完成！"
echo "======================================${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo ""
echo "1. 启动数据库："
echo "   cd /opt/pindoudou && docker-compose up -d postgres redis"
echo ""
echo "2. 查看运行状态："
echo "   docker-compose ps"
echo ""
echo "3. 查看日志："
echo "   docker-compose logs -f postgres"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "- 数据库密码文件：/opt/pindoudou/.env"
echo "- 请务必修改默认密码！"
echo "- 备份 .env 文件到安全位置"
echo ""
echo -e "${GREEN}配置信息：${NC}"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo "- 数据库名: pindoudou"
echo "- 用户名: pindoudou"
echo ""
