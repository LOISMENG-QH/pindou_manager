# 网页版云端配置指南 🌐

## 概述

网页版现在支持两种模式：
1. **本地模式**（原版）：数据存储在浏览器 IndexedDB，离线可用
2. **云端模式**（新版）：数据存储在服务器，支持多设备同步

**当前版本已升级为云端模式**，包含完整的登录注册功能。

## 功能特点

### 云端模式 ✅
- 用户登录注册系统
- 数据存储在服务器
- 多设备实时同步
- 退出登录功能
- 手动同步数据
- 用户信息展示

### 本地模式（已废弃）
- 无需登录
- 数据存储在浏览器
- 不支持跨设备
- 可离线使用

## 配置步骤

### 方式一：使用默认配置（开发测试）

网页版默认连接 `http://localhost:3000`，如果你的后端在本地运行，无需配置。

直接访问：`http://localhost:5173`（开发模式）

### 方式二：配置生产环境

如果要部署到 GitHub Pages 或其他服务器，需要配置生产环境的 API 地址。

#### 1. 创建环境变量文件

在项目根目录创建 `.env.production`：

```bash
cd /root/.openclaw/workspace/pindou-manager
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://你的服务器IP:3000
EOF
```

替换为你的实际 IP，例如：
```
VITE_API_BASE_URL=http://123.456.789.0:3000
```

#### 2. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist/` 目录。

#### 3. 部署到 GitHub Pages

```bash
# 切换到 gh-pages 分支
git checkout gh-pages

# 复制构建文件
cp -r dist/* .

# 提交并推送
git add -A
git commit -m "deploy: 更新云端版网页"
git push origin gh-pages
```

#### 4. 访问

https://loismeng-qh.github.io/pindou_manager/

## 使用流程

### 第一次使用

1. **访问网页**
   - 打开浏览器
   - 访问网页地址

2. **注册账号**
   - 输入邮箱（如 `user@example.com`）
   - 输入密码（至少6位）
   - 输入用户名
   - 点击"注册"

3. **登录**
   - 使用刚才注册的邮箱和密码
   - 点击"登录"

4. **开始使用**
   - 登录后可以看到熟悉的界面
   - 顶部显示用户名
   - 可以同步数据
   - 可以退出登录

### 多设备使用

云端版最大的优势就是多设备同步：

1. **在电脑上**
   - 登录账号
   - 添加豆子和图纸

2. **在手机上**
   - 使用同一个账号登录
   - 可以看到所有数据

3. **在其他电脑上**
   - 登录同一账号
   - 数据完全同步

### 数据同步

网页版会自动从服务器加载数据，但你也可以手动同步：

1. 点击顶部的 🔄 刷新按钮
2. 等待同步完成
3. 数据更新

## 配置 HTTPS（正式发布）

如果要正式使用，建议配置 HTTPS：

### 1. 准备域名

- 购买域名（如 `pindoudou.com`）
- 解析到服务器 IP

### 2. 配置后端 HTTPS

参考 `BACKEND_USAGE.md` 中的 HTTPS 配置章节。

### 3. 修改环境变量

编辑 `.env.production`：
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 4. 重新构建部署

```bash
npm run build
# 部署到 gh-pages
```

## API 地址配置优先级

网页版按以下优先级读取 API 地址：

1. **环境变量** `VITE_API_BASE_URL`（最高优先级）
2. **默认值** `http://localhost:3000`（开发测试）

## 界面说明

### 头部区域

- **标题**：拼豆豆
- **用户信息**：👤 用户名
- **同步按钮**：🔄 刷新图标
- **退出登录**：⬅ 退出图标

### 登录页面

- 渐变紫色背景
- 邮箱 + 密码输入
- 登录/注册模式切换
- 表单验证提示

### 主界面

与原版完全一致：
- 豆子管理
- 图纸管理
- 设置

唯一区别：数据保存在云端

## 开发模式

如果你想本地开发和测试：

### 1. 启动后端

```bash
cd /root/.openclaw/workspace/pindou-manager/backend
docker-compose up -d
```

### 2. 启动前端

```bash
cd /root/.openclaw/workspace/pindou-manager
npm run dev
```

### 3. 访问

打开浏览器访问：http://localhost:5173

## 常见问题

### Q1: 网页版能离线使用吗？
**A**: 云端版不支持离线。如果需要离线功能，可以使用单文件版（standalone），但单文件版没有登录功能。

### Q2: 数据会丢失吗？
**A**: 不会。数据保存在服务器数据库中（PostgreSQL），除非服务器故障。

### Q3: 可以导出数据吗？
**A**: 当前版本暂时移除了导出功能。如果需要，可以在后端数据库直接导出。

### Q4: 忘记密码怎么办？
**A**: 当前版本没有"忘记密码"功能。如果忘记密码：
1. 使用新邮箱注册新账号
2. 或联系管理员在数据库重置密码

### Q5: 登录后看不到数据？
**A**: 检查：
1. 是否注册了新账号（新账号没有数据）
2. 网络是否正常
3. 后端 API 是否运行
4. 浏览器控制台是否有错误

### Q6: 为什么有两个版本？
**A**: 
- **完整版**（index.html）：云端版，支持登录注册，需要后端
- **单文件版**（standalone.html）：离线版，无需后端，但不能同步

### Q7: 如何切换回本地模式？
**A**: 当前版本已经完全升级为云端模式。如果需要本地模式，使用单文件版：
https://loismeng-qh.github.io/pindou_manager/pindou-manager-standalone.html

## 技术细节

### 认证流程

1. 用户输入邮箱密码
2. 发送到 `/api/auth/login`
3. 后端验证并返回 JWT token
4. Token 存储在 localStorage
5. 后续请求自动附带 token

### Token 管理

- **存储位置**：`localStorage.getItem('auth_token')`
- **失效处理**：401 状态自动退出登录
- **刷新机制**：暂无自动刷新，需要重新登录

### API 调用

所有数据操作都通过 API：
- GET `/api/beads` - 获取豆子列表
- POST `/api/beads` - 添加豆子
- PUT `/api/beads/:id` - 更新豆子
- DELETE `/api/beads/:id` - 删除豆子

同理图纸管理：
- GET `/api/patterns`
- POST `/api/patterns`
- PUT `/api/patterns/:id`
- DELETE `/api/patterns/:id`

### 数据同步

点击同步按钮时：
1. 重新从服务器加载所有数据
2. 更新本地状态
3. 刷新界面

## 未来计划

- [ ] 忘记密码功能
- [ ] 自动刷新 Token
- [ ] 数据导出功能
- [ ] 用户头像上传
- [ ] 离线缓存（Service Worker）
- [ ] WebSocket 实时同步
- [ ] 多语言支持

## 参考文档

- 后端 API 文档：`BACKEND_USAGE.md`
- 小程序配置：`MINIPROGRAM_SETUP.md`
- 项目总览：`README.md`

---

**现在你拥有一个完整的云端拼豆管理系统！** 🎉
