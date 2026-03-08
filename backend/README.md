# 拼豆豆后端 API

基于 Node.js + Express + Prisma + PostgreSQL 的后端服务。

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 15+（或使用 Docker）
- Redis（可选）

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DATABASE_URL

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000/health 验证

### Docker 部署

```bash
# 构建镜像
docker build -t pindoudou-api .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  pindoudou-api
```

## 📁 项目结构

```
backend/
├── src/
│   └── index.ts          # 主入口文件
├── prisma/
│   └── schema.prisma     # 数据库模型
├── Dockerfile            # Docker 配置
├── package.json
└── tsconfig.json
```

## 🔌 API 端点

### 认证

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "用户名"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

返回：
```json
{
  "user": { "id": "...", "email": "...", "username": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**GET /api/auth/me**

Headers: `Authorization: Bearer <token>`

### 豆子管理

**GET /api/beads**

Headers: `Authorization: Bearer <token>`

**POST /api/beads**
```json
{
  "colorCode": "A1",
  "colorName": "淡黄",
  "quantity": 100,
  "alertThreshold": 10
}
```

**PUT /api/beads/:id**
```json
{
  "quantity": 150
}
```

**DELETE /api/beads/:id**

### 图纸管理

**GET /api/patterns**

**POST /api/patterns**
```json
{
  "name": "樱花图纸",
  "imageUrl": "data:image/png;base64,...",
  "thumbnailUrl": "data:image/png;base64,...",
  "description": "春天的樱花",
  "status": "planned"
}
```

**PUT /api/patterns/:id**

**DELETE /api/patterns/:id**

### 数据同步

**POST /api/sync**
```json
{
  "beads": [...],
  "patterns": [...]
}
```

## 🔒 认证

所有受保护的端点需要在 Header 中包含 JWT token：

```
Authorization: Bearer <your_token>
```

## 🗄️ 数据库

使用 Prisma ORM，支持：
- PostgreSQL（推荐）
- MySQL
- SQLite（开发环境）

### 迁移

```bash
# 创建迁移
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset
```

## 🐳 Docker Compose 完整示例

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pindoudou
      POSTGRES_USER: pindoudou
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://pindoudou:password@postgres:5432/pindoudou
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## 📊 监控

### 健康检查

```bash
curl http://localhost:3000/health
```

返回：
```json
{
  "status": "ok",
  "timestamp": "2026-03-08T10:30:00.000Z"
}
```

### 日志

生产环境建议使用日志聚合工具：
- Winston
- Pino
- Morgan

## 🔧 配置

### 环境变量

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/pindoudou"

# Redis（可选）
REDIS_URL="redis://:password@localhost:6379"

# JWT
JWT_SECRET="your-random-secret-key"

# 服务器
PORT=3000
NODE_ENV=production
```

## 🚢 部署

详细部署指南请查看：[DEPLOYMENT_GUIDE.md](../deploy/DEPLOYMENT_GUIDE.md)

### 快速部署到腾讯云

```bash
# 1. SSH 连接到服务器
ssh root@your-server-ip

# 2. 运行部署脚本
wget https://raw.githubusercontent.com/LOISMENG-QH/pindou_manager/main/deploy/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# 3. 启动服务
cd /opt/pindoudou
docker-compose up -d
```

## 🛡️ 安全

- ✅ 密码使用 bcrypt 加密
- ✅ JWT token 认证
- ✅ CORS 配置
- ✅ 请求体大小限制
- ⚠️ 生产环境务必修改默认密码
- ⚠️ 使用 HTTPS（Nginx + Let's Encrypt）

## 📈 性能优化

- [ ] Redis 缓存
- [ ] 数据库索引优化
- [ ] API 响应压缩
- [ ] CDN 加速图片
- [ ] 负载均衡

## 🐛 故障排查

### 数据库连接失败

```bash
# 检查数据库是否运行
docker ps | grep postgres

# 测试连接
psql -h localhost -U pindoudou -d pindoudou
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

## 📝 开发日志

- 2026-03-08: 初始化项目，实现基础 CRUD
- 待续...

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License
