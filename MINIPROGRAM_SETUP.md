# 小程序配置指南 📱

## 第一步：获取服务器 IP 地址

1. 登录腾讯云控制台
2. 找到你的轻量应用服务器
3. 复制**公网 IP 地址**（类似 `123.456.789.0`）

## 第二步：修改小程序 API 地址

打开文件：`miniprogram/app.js`

修改第 2 行：
```javascript
const API_BASE_URL = 'http://你的服务器IP:3000';
```

改为（替换成你的实际 IP）：
```javascript
const API_BASE_URL = 'http://123.456.789.0:3000';
```

## 第三步：注册微信小程序

1. 访问 https://mp.weixin.qq.com/
2. 点击"立即注册" → 选择"小程序"
3. 使用邮箱注册（个人/企业都可以）
4. 完成主体信息认证

### 个人小程序
- 费用：免费
- 限制：部分功能受限（支付、直播等）
- 适用场景：个人使用、学习测试

### 企业小程序
- 费用：300元/年（认证费）
- 优势：功能完整，可发布上线
- 需要：营业执照

## 第四步：获取 AppID

1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置
3. 复制 **AppID (小程序ID)**

## 第五步：修改小程序配置

打开文件：`miniprogram/project.config.json`

修改第 45 行：
```json
"appid": "请填写你的小程序 AppID"
```

改为（替换成你的 AppID）：
```json
"appid": "wx1234567890abcdef"
```

## 第六步：下载并导入微信开发者工具

### 下载工具
访问：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

选择你的操作系统下载：
- Windows 64位
- Windows 32位
- macOS
- Linux

### 导入项目

1. 打开微信开发者工具
2. 选择"小程序"
3. 点击"导入项目"或"+"
4. 填写信息：
   - **项目目录**：选择 `/root/.openclaw/workspace/pindou-manager/miniprogram`
   - **AppID**：填写你的 AppID（或选择测试号）
   - **项目名称**：拼豆豆

5. 点击"导入"

## 第七步：配置开发调试

在微信开发者工具中：

1. 点击右上角"详情"
2. 勾选 **"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
3. 关闭详情窗口
4. 点击"编译"按钮

## 第八步：测试功能

在左侧模拟器中：

1. **注册账号**
   - 输入邮箱（如 `test@example.com`）
   - 输入密码（至少6位）
   - 输入用户名
   - 点击"注册"

2. **登录**
   - 切换到登录模式
   - 输入刚才的邮箱和密码
   - 点击"登录"

3. **测试豆子管理**
   - 点击底部"豆子管理"
   - 点击"添加豆子"
   - 选择预设色号或输入自定义色号
   - 保存

4. **测试图纸管理**
   - 点击底部"图纸管理"
   - 点击"+"添加图纸
   - 选择图片（从电脑选择测试图片）
   - 填写名称
   - 保存

5. **测试设置**
   - 点击底部"设置"
   - 查看数据统计
   - 点击"同步数据"
   - 点击"API 状态"

## 第九步：真机测试（可选）

1. 点击工具栏的"预览"按钮
2. 用微信扫描生成的二维码
3. 在手机上测试小程序

⚠️ **注意**：
- 真机测试需要服务器的 IP 地址能被外网访问
- 如果无法访问，检查防火墙设置
- 确保 3000 端口已开放

## 第十步：发布上线（正式）

### 配置 HTTPS（必需）

小程序正式发布必须使用 HTTPS，参考 `BACKEND_USAGE.md` 配置：

1. **准备域名**
   - 购买域名（如 `api.yourdomain.com`）
   - 解析到服务器 IP

2. **安装 Nginx**
```bash
apt install nginx
```

3. **配置反向代理**
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
    }
}
EOF

ln -s /etc/nginx/sites-available/pindoudou /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

4. **申请 SSL 证书**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

5. **修改小程序 API 地址**

编辑 `miniprogram/app.js`：
```javascript
const API_BASE_URL = 'https://api.yourdomain.com';
```

6. **配置服务器域名**

在微信公众平台后台：
- 开发 → 开发管理 → 开发设置
- 服务器域名 → request合法域名
- 添加：`https://api.yourdomain.com`
- 保存

7. **提交审核**

在微信开发者工具中：
- 点击"上传"按钮
- 填写版本号和项目备注
- 上传代码

然后在微信公众平台：
- 开发管理 → 版本管理
- 点击"提交审核"
- 填写审核信息
- 等待审核（通常1-7天）

8. **发布上线**

审核通过后：
- 点击"发布"按钮
- 小程序正式上线

## 常见问题

### Q1: 找不到服务器 IP
**A**: 
1. 登录腾讯云控制台
2. 轻量应用服务器 → 实例列表
3. 查看"公网 IP"列

### Q2: API 连接失败
**A**: 
1. 检查 API 地址是否正确
2. 确认服务器正在运行：`docker-compose ps`
3. 检查防火墙：端口 3000 是否开放
4. 勾选"不校验合法域名"

### Q3: 无法注册账号
**A**: 
1. 检查邮箱格式是否正确
2. 密码至少6位
3. 查看控制台是否有错误信息
4. 确认后端 API 正常运行

### Q4: 真机测试无法访问
**A**: 
1. 确保服务器公网 IP 可访问
2. 检查防火墙规则
3. 尝试在手机浏览器访问 `http://你的IP:3000/health`
4. 如果无法访问，联系云服务商客服

### Q5: 提交审核被拒
**A**: 常见原因：
- 服务器域名未配置 HTTPS
- 域名未在微信后台配置
- 功能不完整或有bug
- 违反微信小程序规范

## 快速检查清单

开发调试：
- [ ] 已获取服务器 IP
- [ ] 已修改 `app.js` 中的 API_BASE_URL
- [ ] 已注册微信小程序
- [ ] 已获取 AppID
- [ ] 已修改 `project.config.json` 中的 appid
- [ ] 已下载微信开发者工具
- [ ] 已成功导入项目
- [ ] 已勾选"不校验合法域名"
- [ ] 已成功编译运行
- [ ] 已测试注册登录
- [ ] 已测试豆子管理
- [ ] 已测试图纸管理

正式发布（额外）：
- [ ] 已购买域名
- [ ] 已配置域名解析
- [ ] 已安装 Nginx
- [ ] 已申请 SSL 证书
- [ ] 已修改 API 地址为 HTTPS
- [ ] 已在微信后台配置服务器域名
- [ ] 已提交审核
- [ ] 已通过审核并发布

## 需要帮助？

参考完整文档：
- 网页版使用指南：`/root/.openclaw/workspace/pindou-manager/README.md`
- 后端 API 文档：`/root/.openclaw/workspace/pindou-manager/BACKEND_USAGE.md`
- 小程序开发文档：`/root/.openclaw/workspace/pindou-manager/miniprogram/README.md`

或在 GitHub 提交 Issue：
https://github.com/LOISMENG-QH/pindou_manager/issues

---

**祝你使用愉快！** 🎉
