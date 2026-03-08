# Railway 一键部署指南

## 第一步：注册 Railway（1分钟）

1. 访问：https://railway.app/
2. 点击 "Start a New Project"
3. 使用 GitHub 登录（最快）
4. 授权 Railway 访问你的 GitHub

## 第二步：部署数据库（2分钟）

1. 在 Railway 控制台，点击 "New Project"
2. 选择 "Provision PostgreSQL"
3. 等待数据库创建完成（约30秒）
4. 点击数据库 → "Connect" → 复制 `DATABASE_URL`

示例：
```
DATABASE_URL=postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway
```

## 第三步：部署后端 API（2分钟）

### 方式A：从 GitHub 部署（推荐）

1. 在 Railway 点击 "New" → "GitHub Repo"
2. 选择你的仓库：`LOISMENG-QH/pindou_manager`
3. Root Directory: 输入 `backend`
4. 点击 "Deploy"

### 方式B：使用 Railway CLI

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 进入后端目录
cd /root/.openclaw/workspace/pindou-manager/backend

# 初始化项目
railway init

# 部署
railway up
```

## 第四步：配置环境变量（1分钟）

1. 点击你的服务 → "Variables"
2. 添加以下变量：

```
DATABASE_URL=postgresql://postgres:xxx@...  (从第二步复制)
JWT_SECRET=your-random-secret-key
NODE_ENV=production
PORT=3000
```

3. 点击 "Deploy" 重新部署

## 第五步：获取 API 地址（30秒）

1. 点击服务 → "Settings" → "Domains"
2. 点击 "Generate Domain"
3. 获得类似这样的地址：
   ```
   https://pindoudou-api-production.up.railway.app
   ```

4. 测试：
   ```bash
   curl https://你的域名.railway.app/health
   ```

## 完成！🎉

你现在有：
- ✅ 后端 API（自动 HTTPS）
- ✅ PostgreSQL 数据库
- ✅ 自动部署（Git 推送即更新）
- ✅ 免费运行（$5/月额度）

## 监控和日志

1. **查看日志**
   - Railway 控制台 → 你的服务 → "Deployments" → 点击最新部署

2. **查看资源使用**
   - "Metrics" 标签

3. **查看成本**
   - 右上角显示剩余额度

## 更新代码

```bash
# 修改代码后
git add .
git commit -m "更新"
git push

# Railway 会自动检测并重新部署！
```

## 成本估算

**示例项目（拼豆豆）：**
- API 服务：~$3/月
- PostgreSQL：~$1/月
- 总计：~$4/月

**$5 免费额度足够使用！**

## 扩展：添加 Redis（可选）

1. Railway 控制台 → "New" → "Database" → "Redis"
2. 获取 `REDIS_URL`
3. 添加到环境变量

## 自定义域名（可选）

1. 购买域名（阿里云/腾讯云）
2. Railway → "Settings" → "Domains"
3. 点击 "Custom Domain"
4. 输入你的域名
5. 在域名 DNS 添加 CNAME 记录

示例：
```
api.pindoudou.com → CNAME → your-app.up.railway.app
```

## 备份数据库

```bash
# 安装 Railway CLI
railway login

# 连接到数据库
railway connect postgres

# 导出数据
pg_dump railway > backup.sql
```

## 迁移到其他平台

Railway 使用标准 Docker/Dockerfile，迁移超简单：

```bash
# 导出环境变量
railway variables > .env

# 导出数据库
railway run pg_dump > backup.sql

# 在新平台导入
psql $NEW_DATABASE_URL < backup.sql
```
