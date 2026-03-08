# 拼豆豆管理系统 🎨

一个现代化的拼豆（Perler Beads）管理工具，帮助你轻松管理拼豆色号库存和图纸。

## ✨ 功能特点

### 前端功能
- 🎨 **豆子管理**
  - 221 色 MARD 预设色号库
  - 按系列分组显示（A-H, M）
  - 库存数量快速调整
  - 低库存自动提醒
  - 批量添加预设色号

- 📐 **图纸管理**
  - 想拼/已拼分区管理
  - 图片上传和预览
  - 用量智能录入（色号选择器 + 文字解析）
  - 自动扣减库存

- 🎨 **主题系统**
  - 6 种预设主题
  - 暗黑模式支持

- 💾 **数据管理**
  - 本地 IndexedDB 存储
  - 数据导入/导出（JSON）

### 后端 API（新）
- 🔐 **用户系统**
  - 用户注册/登录
  - JWT 认证
  
- ☁️ **云端存储**
  - PostgreSQL 数据库
  - Redis 缓存
  - 豆子/图纸 CRUD API
  - 数据同步接口

- 🐳 **容器化部署**
  - Docker + Docker Compose
  - 一键部署脚本
  - 自动数据库迁移

## 🚀 快速开始

### 在线使用（推荐）

**前端网页版：**
- 完整版：https://loismeng-qh.github.io/pindou_manager/
- 单文件版：https://loismeng-qh.github.io/pindou_manager/pindou-manager-standalone.html

**后端 API：**
- 地址：`http://你的服务器IP:3000`
- 健康检查：`http://你的服务器IP:3000/health`
- API 文档：见下方

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/LOISMENG-QH/pindou_manager.git
cd pindou_manager

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 生成单文件版本
./build-standalone.sh
```

## 📡 后端部署

### 快速部署到腾讯云

1. **创建服务器**
   - 腾讯云轻量应用服务器
   - 配置防火墙：开放 22, 80, 3000, 5432, 6379 端口

2. **运行部署脚本**
   ```bash
   wget https://raw.githubusercontent.com/LOISMENG-QH/pindou_manager/main/deploy/setup-server.sh
   chmod +x setup-server.sh
   ./setup-server.sh
   ```

3. **手动部署（如果自动脚本失败）**
   ```bash
   # 详见 deploy/DEPLOYMENT_GUIDE.md
   ```

### 其他部署方案

- **Railway**: 见 `deploy/RAILWAY_GUIDE.md`
- **Docker 主机**: 任何支持 Docker 的服务器

## 📚 API 文档

### 基础地址
```
http://你的服务器IP:3000
```

### 认证接口

**注册**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password",
  "username": "用户名"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "用户名"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**登录**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**获取当前用户**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 豆子管理

**获取豆子列表**
```http
GET /api/beads
Authorization: Bearer <token>
```

**添加豆子**
```http
POST /api/beads
Authorization: Bearer <token>
Content-Type: application/json

{
  "colorCode": "A1",
  "colorName": "淡黄",
  "quantity": 100,
  "alertThreshold": 10
}
```

**更新豆子**
```http
PUT /api/beads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 150
}
```

**删除豆子**
```http
DELETE /api/beads/:id
Authorization: Bearer <token>
```

### 图纸管理

接口同豆子管理，端点为 `/api/patterns`

### 数据同步

**批量同步数据**
```http
POST /api/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "beads": [...],
  "patterns": [...]
}
```

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- IndexedDB (Dexie.js)
- Lucide React (图标)

### 后端
- Node.js 18
- Express 4
- TypeScript
- Prisma ORM 5
- PostgreSQL 15
- Redis 7
- JWT 认证
- bcrypt 密码加密

### 部署
- Docker & Docker Compose
- GitHub Pages (前端)
- 腾讯云/Railway (后端)

## 📁 项目结构

```
pindou_manager/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── db.ts              # IndexedDB 配置
│   ├── types.ts           # TypeScript 类型
│   ├── utils.ts           # 工具函数
│   ├── theme.ts           # 主题配置
│   └── api.ts             # API 客户端（新）
├── backend/               # 后端源代码
│   ├── src/index.ts       # API 入口
│   ├── prisma/schema.prisma  # 数据库模型
│   ├── Dockerfile         # Docker 构建
│   └── package.json
├── deploy/                # 部署脚本和文档
│   ├── setup-server.sh    # 自动部署脚本
│   ├── DEPLOYMENT_GUIDE.md  # 部署指南
│   └── RAILWAY_GUIDE.md   # Railway 部署指南
├── miniprogram/           # 小程序版本（开发中）
└── dist/                  # 构建输出
```

## 🔒 安全建议

1. **修改默认密码**
   ```bash
   cd /opt/pindoudou
   nano .env
   # 修改 DB_PASSWORD, JWT_SECRET, REDIS_PASSWORD
   docker-compose restart
   ```

2. **配置 HTTPS**
   - 申请 SSL 证书（Let's Encrypt）
   - 配置 Nginx 反向代理

3. **限制 API 访问**
   - 配置 CORS 白名单
   - 启用速率限制

## 📝 开发计划

- [x] 前端网页版
- [x] 后端 API 服务
- [x] Docker 容器化部署
- [x] 腾讯云部署脚本
- [ ] 前端连接云端 API
- [ ] 小程序版本
- [ ] 数据分析统计
- [ ] 图片 AI 识别（可选）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

LOISMENG-QH

## 🔗 链接

- GitHub: https://github.com/LOISMENG-QH/pindou_manager
- 在线演示: https://loismeng-qh.github.io/pindou_manager/
- API 文档: 见上方

---

**更新日志**

### 2026-03-09
- ✅ 添加完整后端 API 服务
- ✅ Docker 容器化部署
- ✅ 腾讯云一键部署脚本
- ✅ PostgreSQL + Redis 数据存储
- ✅ JWT 用户认证系统
- ✅ 数据同步接口

### 2026-03-08
- ✅ 应用标题改为"拼豆豆"
- ✅ 修复未知色号显示问题
- ✅ 豆子库存系列分组
- ✅ 批量添加预设色号
- ✅ 智能用量录入
- ✅ 图纸管理优化
- ✅ 暗黑模式优化

---

💡 **提示**: 如果你只需要离线使用，直接访问网页版即可。如果需要多设备同步，可以部署后端 API 服务。
