# 后端 API 使用指南

## 🎯 概述

拼豆豆后端 API 已成功部署到腾讯云，提供云端数据存储和多设备同步功能。

## 📍 服务地址

- **API 基础地址**: `http://你的服务器IP:3000`
- **健康检查**: `http://你的服务器IP:3000/health`
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7

## 🔐 认证流程

### 1. 注册账号

```bash
curl -X POST http://你的IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword",
    "username": "你的名字"
  }'
```

**响应示例：**
```json
{
  "user": {
    "id": "uuid",
    "email": "your@email.com",
    "username": "你的名字"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

保存返回的 `token`，后续请求都需要它。

### 2. 登录

```bash
curl -X POST http://你的IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

## 📦 豆子管理

### 添加豆子

```bash
TOKEN="你的token"

curl -X POST http://你的IP:3000/api/beads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "colorCode": "A1",
    "colorName": "淡黄",
    "quantity": 100,
    "alertThreshold": 10
  }'
```

### 获取豆子列表

```bash
curl http://你的IP:3000/api/beads \
  -H "Authorization: Bearer $TOKEN"
```

### 更新豆子数量

```bash
BEAD_ID="豆子的ID"

curl -X PUT http://你的IP:3000/api/beads/$BEAD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "quantity": 150
  }'
```

### 删除豆子

```bash
curl -X DELETE http://你的IP:3000/api/beads/$BEAD_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 📐 图纸管理

### 添加图纸

```bash
curl -X POST http://你的IP:3000/api/patterns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "樱花图纸",
    "imageUrl": "data:image/png;base64,...",
    "thumbnailUrl": "data:image/png;base64,...",
    "description": "春天的樱花",
    "status": "planned"
  }'
```

### 获取图纸列表

```bash
curl http://你的IP:3000/api/patterns \
  -H "Authorization: Bearer $TOKEN"
```

### 更新图纸状态

```bash
PATTERN_ID="图纸的ID"

curl -X PUT http://你的IP:3000/api/patterns/$PATTERN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "completed",
    "beadsUsed": [
      {"colorCode": "A1", "colorName": "淡黄", "quantity": 52},
      {"colorCode": "F7", "colorName": "黑色", "quantity": 120}
    ]
  }'
```

## 🔄 批量同步

```bash
curl -X POST http://你的IP:3000/api/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "beads": [
      {"colorCode": "A1", "colorName": "淡黄", "quantity": 100, "alertThreshold": 10},
      {"colorCode": "A2", "colorName": "浅黄", "quantity": 80, "alertThreshold": 10}
    ],
    "patterns": [
      {
        "name": "测试图纸",
        "imageUrl": "data:image/png;base64,...",
        "thumbnailUrl": "data:image/png;base64,...",
        "status": "planned"
      }
    ]
  }'
```

## 🧪 使用 Postman 测试

1. **导入环境变量**
   - 创建变量 `base_url`: `http://你的IP:3000`
   - 创建变量 `token`: (登录后获取)

2. **设置 Authorization**
   - Type: Bearer Token
   - Token: `{{token}}`

3. **测试请求**
   - 先调用 `/api/auth/register` 或 `/api/auth/login`
   - 复制返回的 token 到环境变量
   - 测试其他接口

## 🔧 服务器管理

### 查看服务状态

```bash
cd /opt/pindoudou
docker-compose ps
```

### 查看 API 日志

```bash
docker-compose logs -f api
```

### 重启服务

```bash
docker-compose restart api
```

### 备份数据库

```bash
docker exec pindoudou-db pg_dump -U pindoudou pindoudou > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
cat backup.sql | docker exec -i pindoudou-db psql -U pindoudou -d pindoudou
```

## 🌐 配置域名（可选）

### 1. DNS 解析

在你的域名服务商添加 A 记录：

```
api.yourdomain.com -> 你的服务器IP
```

### 2. 安装 Nginx

```bash
apt install nginx
```

### 3. 配置反向代理

```bash
cat > /etc/nginx/sites-available/pindoudou << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -s /etc/nginx/sites-available/pindoudou /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. 申请 SSL 证书

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

现在你可以使用 `https://api.yourdomain.com` 访问 API 了！

## 🔒 安全加固

### 1. 修改默认密码

```bash
cd /opt/pindoudou
nano .env
```

修改：
- `DB_PASSWORD` - 数据库密码
- `JWT_SECRET` - JWT 密钥（使用 `openssl rand -base64 32` 生成）
- `REDIS_PASSWORD` - Redis 密码

保存后：
```bash
docker-compose restart
```

### 2. 配置防火墙

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 3000/tcp   # API（如果使用 Nginx 反向代理）
ufw deny 5432/tcp   # PostgreSQL
ufw deny 6379/tcp   # Redis
ufw enable
```

### 3. 限制 API 访问频率

在 `backend/src/index.ts` 中添加速率限制中间件（如 `express-rate-limit`）。

## 📊 监控和维护

### 查看资源使用

```bash
docker stats
```

### 清理 Docker 镜像

```bash
docker system prune -a
```

### 设置自动备份

创建 cron 任务：

```bash
crontab -e
```

添加：

```
# 每天凌晨 2 点备份数据库
0 2 * * * docker exec pindoudou-db pg_dump -U pindoudou pindoudou > /opt/backups/pindoudou_$(date +\%Y\%m\%d).sql
```

## 🆘 常见问题

### API 无法访问

1. 检查防火墙是否开放 3000 端口
2. 检查 Docker 容器是否运行：`docker-compose ps`
3. 查看日志：`docker-compose logs api`

### 数据库连接失败

1. 检查 PostgreSQL 容器状态
2. 验证环境变量配置
3. 检查数据库密码是否正确

### Token 无效

1. Token 可能已过期（默认 30 天）
2. 重新登录获取新 token
3. 检查 Authorization header 格式：`Bearer <token>`

## 📞 技术支持

如有问题，请：

1. 查看完整部署日志
2. 检查 `docker-compose logs`
3. 在 GitHub 提交 Issue

---

**提示**: 记得定期备份数据库！🎯
