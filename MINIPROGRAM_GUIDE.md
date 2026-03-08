# 拼豆豆小程序使用指南 📱

## 🎉 恭喜！小程序开发完成

所有核心功能已开发完毕，可以直接使用！

---

## 📦 包含的完整功能

### 1. 登录注册 ✅
- 邮箱 + 密码登录
- 新用户注册
- JWT Token 认证
- 自动登录保持

### 2. 豆子管理 ✅
- 查看所有豆子
- 搜索豆子（色号/名称）
- 添加新豆子
- 编辑豆子信息
- 删除豆子
- 快速调整数量（+1, +10, -1, -10）
- 低库存自动提醒
- 10 个预设色号快捷选择

### 3. 图纸管理 ✅
- 想拼/已拼分类
- 网格展示图纸
- 拍照或相册上传
- 自动压缩和缩略图
- 查看图纸详情
- 放大预览图片
- 标记完成状态
- 删除图纸

### 4. 设置中心 ✅
- 用户信息展示
- 数据统计（豆子数、图纸数、完成数、低库存数）
- 同步云端数据
- 检查 API 状态
- 清空本地缓存
- 关于页面
- 退出登录

---

## 🚀 如何使用

### 第一步：配置 API 地址

1. 打开 `miniprogram/app.js`
2. 修改第 2 行的 API 地址：

```javascript
const API_BASE_URL = 'http://你的服务器IP:3000';
```

改为你的实际服务器地址，例如：
```javascript
const API_BASE_URL = 'http://123.456.789.0:3000';
```

⚠️ **重要**：正式发布必须使用 HTTPS！

### 第二步：配置 AppID

1. 打开 `miniprogram/project.config.json`
2. 找到第 36 行（或搜索 "appid"）
3. 修改为你的小程序 AppID：

```json
"appid": "你的小程序AppID"
```

如何获取 AppID？
- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 开发 > 开发管理 > 开发设置 > AppID

### 第三步：导入项目

1. 打开微信开发者工具
2. 选择"小程序"
3. 点击"导入项目"
4. 目录选择：`/root/.openclaw/workspace/pindou-manager/miniprogram`
5. AppID 填入你的小程序 AppID
6. 项目名称：拼豆豆
7. 点击"导入"

### 第四步：开发调试

1. 在微信开发者工具中，勾选"不校验合法域名"
   - 位置：详情 > 本地设置 > 不校验合法域名
   
2. 点击"编译"按钮

3. 在模拟器中测试功能

### 第五步：真机测试

1. 点击"预览"按钮
2. 用微信扫描二维码
3. 在手机上测试完整功能

⚠️ **注意**：真机测试时，服务器必须可以被外网访问！

---

## 🌐 配置 HTTPS（正式发布必需）

小程序正式发布必须使用 HTTPS，参考《BACKEND_USAGE.md》配置：

### 1. 准备域名

购买域名并解析到你的服务器 IP

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

### 5. 修改小程序 API 地址

```javascript
const API_BASE_URL = 'https://api.yourdomain.com';
```

### 6. 配置服务器域名

在微信公众平台后台：

**开发 > 开发管理 > 开发设置 > 服务器域名**

添加：
```
https://api.yourdomain.com
```

---

## 📱 TabBar 图标（可选）

小程序底部导航需要图标，当前使用占位符。

### 快速添加图标

1. 查看 `miniprogram/images/ICONS_README.md` 了解需要的图标
2. 从 [Iconfont](https://www.iconfont.cn/) 下载图标
3. 准备 6 个图标文件：
   - bead.png / bead-active.png
   - pattern.png / pattern-active.png
   - settings.png / settings-active.png
4. 放入 `miniprogram/images/` 目录
5. 重新编译

⚠️ **提示**：开发测试阶段可以不添加图标，不影响功能。

---

## 🧪 功能测试清单

### 登录注册
- [ ] 新用户注册
- [ ] 邮箱格式验证
- [ ] 密码长度验证
- [ ] 登录成功跳转
- [ ] Token 自动保存

### 豆子管理
- [ ] 查看豆子列表
- [ ] 搜索豆子
- [ ] 添加新豆子
- [ ] 编辑豆子
- [ ] 删除豆子（带确认）
- [ ] +1 调整数量
- [ ] +10 调整数量
- [ ] -1 调整数量
- [ ] -10 调整数量
- [ ] 低库存红框显示
- [ ] 预设色号选择
- [ ] 下拉刷新

### 图纸管理
- [ ] 想拼/已拼切换
- [ ] 网格显示图纸
- [ ] 拍照上传
- [ ] 相册选择
- [ ] 图片压缩
- [ ] 查看详情
- [ ] 放大预览
- [ ] 标记完成
- [ ] 删除图纸
- [ ] 下拉刷新

### 设置页面
- [ ] 用户信息显示
- [ ] 数据统计正确
- [ ] 同步数据
- [ ] API 健康检查
- [ ] 清空缓存
- [ ] 关于页面
- [ ] 退出登录

---

## 🐛 常见问题

### 1. 登录失败

**问题**：提示"网络连接失败"

**解决**：
- 检查 API 地址是否正确
- 确认服务器正在运行：`docker-compose ps`
- 检查防火墙是否开放 3000 端口
- 在微信开发者工具中勾选"不校验合法域名"

### 2. 图片上传失败

**问题**：选择图片后提示"图片处理失败"

**解决**：
- 选择体积较小的图片（< 5MB）
- 使用压缩图片选项
- 检查服务器存储空间

### 3. 真机预览看不到数据

**问题**：模拟器正常，手机上看不到数据

**解决**：
- 确认服务器可以被外网访问
- 检查手机网络连接
- 清空小程序缓存重试

### 4. 提交审核被拒

**问题**：提示"服务器域名配置错误"

**解决**：
- 必须配置 HTTPS
- 必须在公众平台配置服务器域名
- 域名必须已备案（国内服务器）

---

## 📚 参考文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [后端 API 使用指南](../BACKEND_USAGE.md)
- [部署指南](../deploy/DEPLOYMENT_GUIDE.md)
- [项目总结](../PROJECT_COMPLETE_SUMMARY.md)

---

## 🎯 下一步

### 立即可做
- ✅ 配置 API 地址
- ✅ 导入微信开发者工具
- ✅ 测试所有功能
- ⏳ 配置 HTTPS（正式发布前）
- ⏳ 添加图标（可选）

### 可选增强
- 用豆记录功能（在图纸详情添加）
- 数据导出功能
- 分享功能
- 统计图表
- 暗黑模式

---

## 💡 提示

1. **开发测试**：可以使用 HTTP + 勾选"不校验域名"
2. **真机预览**：需要服务器外网可访问
3. **正式发布**：必须 HTTPS + 配置域名
4. **图标资源**：不影响功能，可以后期添加

---

## 🎉 完成！

小程序已经可以使用了！所有核心功能都已实现：

✅ 登录注册  
✅ 豆子管理  
✅ 图纸管理  
✅ 设置中心  
✅ 云端同步  
✅ 多设备共享  

开始使用你的拼豆豆管理小程序吧！🚀

---

**有问题？**

1. 查看 `miniprogram/README.md` 获取更多技术细节
2. 在 GitHub 提交 Issue
3. 参考《常见问题》章节

祝使用愉快！🎨
