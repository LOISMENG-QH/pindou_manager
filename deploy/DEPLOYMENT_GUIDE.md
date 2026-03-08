# 拼豆豆后端部署指南

## 🎯 快速部署（5分钟）

### 第一步：连接到腾讯云服务器

```bash
# 用你的服务器 IP 替换 YOUR_SERVER_IP
ssh root@YOUR_SERVER_IP
```

### 第二步：下载并运行自动配置脚本

```bash
# 下载脚本（如果你把项目推送到了 GitHub）
wget https://raw.githubusercontent.com/LOISMENG-QH/pindou_manager/main/deploy/setup-server.sh

# 或者直接创建脚本（复制下面的内容）
nano setup-server.sh
# 粘贴 setup-server.sh 的内容，然后 Ctrl+X 保存

# 添加执行权限
chmod +x setup-server.sh

# 运行脚本
./setup-server.sh
```

脚本会自动完成：
- ✅ 更新系统
- ✅ 安装 Docker 和 Docker Compose
- ✅ 创建项目目录
- ✅ 配置防火墙
- ✅ 生成配置文件

### 第三步：启动数据库

```bash
cd /opt/pindoudou

# 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis

# 查看运行状态（应该显示 2 个容器）
docker-compose ps

# 查看日志（确认启动成功）
docker-compose logs postgres
```

### 第四步：部署后端 API

**方式1：直接克隆项目（如果代码在 GitHub）**

```bash
cd /opt/pindoudou

# 克隆后端代码
git clone https://github.com/LOISMENG-QH/pindou_manager.git
cd pindou_manager/backend

# 构建 Docker 镜像
docker build -t pindoudou-api:latest .

# 返回项目根目录
cd /opt/pindoudou

# 取消 docker-compose.yml 中 api 部分的注释
nano docker-compose.yml
# 删除 api 服务前的 # 注释

# 启动 API 服务
docker-compose up -d api
```

**方式2：手动上传代码**

```bash
# 在本地电脑执行（将后端代码打包）
cd /root/.openclaw/workspace/pindou-manager/backend
tar -czf backend.tar.gz .

# 上传到服务器
scp backend.tar.gz root@YOUR_SERVER_IP:/opt/pindoudou/

# 在服务器上解压
cd /opt/pindoudou
mkdir -p api
cd api
tar -xzf ../backend.tar.gz

# 构建镜像
docker build -t pindoudou-api:latest .

# 启动服务
cd /opt/pindoudou
docker-compose up -d api
```

### 第五步：验证部署

```bash
# 检查所有容器运行状态
docker-compose ps

# 应该看到 3 个容器：
# - pindoudou-db (postgres)
# - pindoudou-redis (redis)
# - pindoudou-api (api)

# 测试 API
curl http://localhost:3000/health

# 应该返回：{"status":"ok","timestamp":"..."}

# 查看 API 日志
docker-compose logs -f api
```

### 第六步：配置环境变量（重要！）

```bash
cd /opt/pindoudou

# 编辑环境变量
nano .env

# 修改默认密码（强烈推荐！）
DB_PASSWORD=your_strong_password_here
REDIS_PASSWORD=your_redis_password_here
JWT_SECRET=your_random_secret_here

# 保存后重启服务
docker-compose restart
```

---

## 🌐 配置域名和 HTTPS（可选）

### 如果你有域名（如 api.pindoudou.com）

**1. 安装 Nginx**

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

**2. 配置 Nginx**

```bash
nano /etc/nginx/sites-available/pindoudou-api
```

粘贴以下内容：

```nginx
server {
    listen 80;
    server_name api.pindoudou.com;  # 改成你的域名

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
```

```bash
# 启用配置
ln -s /etc/nginx/sites-available/pindoudou-api /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

**3. 申请 SSL 证书**

```bash
certbot --nginx -d api.pindoudou.com
```

现在可以通过 `https://api.pindoudou.com` 访问 API！

---

## 📊 常用命令

### 查看运行状态
```bash
cd /opt/pindoudou
docker-compose ps
```

### 查看日志
```bash
# 查看所有日志
docker-compose logs -f

# 只看 API 日志
docker-compose logs -f api

# 只看数据库日志
docker-compose logs -f postgres
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 只重启 API
docker-compose restart api
```

### 停止服务
```bash
docker-compose stop
```

### 启动服务
```bash
docker-compose up -d
```

### 更新代码
```bash
cd /opt/pindoudou/api
git pull origin main
docker build -t pindoudou-api:latest .
cd /opt/pindoudou
docker-compose up -d --force-recreate api
```

---

## 🔒 安全建议

1. **修改默认密码**
   ```bash
   cd /opt/pindoudou
   nano .env
   # 修改 DB_PASSWORD 和 REDIS_PASSWORD
   ```

2. **限制数据库端口访问**
   ```bash
   # 编辑 docker-compose.yml，将 PostgreSQL 端口改为内网
   # ports:
   #   - "127.0.0.1:5432:5432"  # 只允许本地访问
   ```

3. **启用防火墙**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **定期备份数据库**
   ```bash
   # 创建备份脚本
   nano /opt/pindoudou/backup.sh
   ```

   粘贴：
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker exec pindoudou-db pg_dump -U pindoudou pindoudou > /opt/backups/db_$DATE.sql
   # 保留最近 7 天的备份
   find /opt/backups -name "db_*.sql" -mtime +7 -delete
   ```

   ```bash
   chmod +x /opt/pindoudou/backup.sh
   
   # 添加定时任务（每天凌晨 2 点备份）
   crontab -e
   # 添加：0 2 * * * /opt/pindoudou/backup.sh
   ```

---

## 🐛 故障排查

### API 无法启动

```bash
# 查看详细日志
docker-compose logs api

# 常见问题：
# 1. 数据库连接失败 → 检查 DATABASE_URL 环境变量
# 2. 端口被占用 → 修改 docker-compose.yml 中的端口
# 3. 权限问题 → 确保以 root 身份运行
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 测试连接
docker exec -it pindoudou-db psql -U pindoudou -d pindoudou

# 如果成功，会进入 PostgreSQL 命令行
```

### 查看容器资源使用

```bash
docker stats
```

---

## 📦 数据迁移

### 导出数据

```bash
# 导出数据库
docker exec pindoudou-db pg_dump -U pindoudou pindoudou > backup.sql

# 导出图片（如果存在）
docker cp pindoudou-api:/app/uploads ./uploads_backup
```

### 导入数据到新服务器

```bash
# 1. 在新服务器上运行 setup-server.sh
# 2. 启动数据库
docker-compose up -d postgres

# 3. 导入数据
cat backup.sql | docker exec -i pindoudou-db psql -U pindoudou pindoudou

# 4. 导入图片
docker cp uploads_backup pindoudou-api:/app/uploads

# 5. 启动 API
docker-compose up -d api
```

---

## 🎯 API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 豆子管理
- `GET /api/beads` - 获取豆子列表
- `POST /api/beads` - 创建豆子
- `PUT /api/beads/:id` - 更新豆子
- `DELETE /api/beads/:id` - 删除豆子

### 图纸管理
- `GET /api/patterns` - 获取图纸列表
- `POST /api/patterns` - 创建图纸
- `PUT /api/patterns/:id` - 更新图纸
- `DELETE /api/patterns/:id` - 删除图纸

### 数据同步
- `POST /api/sync` - 批量同步数据

---

## 💡 下一步

1. 修改前端代码，连接到后端 API
2. 实现用户登录界面
3. 替换 IndexedDB 调用为 API 调用
4. 测试数据同步功能

**需要帮助？** 随时联系我！
