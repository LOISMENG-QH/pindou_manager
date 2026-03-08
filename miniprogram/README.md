# 拼豆豆小程序开发指南

## 📱 概述

拼豆豆小程序版本，直接连接云端 API，支持：
- 用户登录注册
- 豆子管理（云端存储）
- 图纸管理（云端存储）
- 多设备实时同步

## 🚀 快速开始

### 1. 准备工作

**环境要求：**
- 微信开发者工具
- 微信小程序账号（AppID）
- 后端 API 已部署

### 2. 配置小程序

#### 修改 API 地址

编辑 `miniprogram/app.js`，修改第 2 行：

```javascript
const API_BASE_URL = 'http://你的服务器IP:3000'; // 改为你的后端地址
```

#### 配置 AppID

编辑 `miniprogram/project.config.json`，修改第 36 行：

```json
"appid": "你的小程序AppID"
```

### 3. 配置服务器域名

在微信公众平台后台配置：

**开发设置 > 服务器域名 > request合法域名**

添加：
```
https://你的域名.com
```

⚠️ **注意**：小程序必须使用 HTTPS，需要配置 SSL 证书！

如果仅用于开发测试，可以在微信开发者工具中勾选"不校验合法域名"。

### 4. 导入项目

1. 打开微信开发者工具
2. 选择"小程序" > "导入"
3. 目录选择 `miniprogram` 文件夹
4. 填写 AppID
5. 点击"导入"

### 5. 编译运行

点击"编译"按钮，即可在模拟器中查看效果。

## 📁 项目结构

```
miniprogram/
├── app.js                 # 小程序入口，全局逻辑
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
├── pages/                # 页面目录
│   ├── auth/            # 登录注册页
│   │   ├── auth.js
│   │   ├── auth.wxml
│   │   ├── auth.wxss
│   │   └── auth.json
│   ├── beads/           # 豆子管理页（待开发）
│   ├── patterns/        # 图纸管理页（待开发）
│   └── settings/        # 设置页（待开发）
└── images/              # 图片资源（待添加）
```

## ✅ 已完成功能

- [x] 项目基础配置
- [x] API 封装（app.js）
- [x] 登录注册页面
- [x] Token 认证
- [x] 全局样式

## 🔨 待开发功能

### 豆子管理页 (pages/beads/)

**功能需求：**
- 显示豆子列表（从 API 获取）
- 添加豆子
- 编辑豆子数量
- 删除豆子
- 低库存提醒
- 搜索和筛选

**API 调用示例：**

```javascript
// 获取豆子列表
const beads = await app.request('/api/beads');

// 添加豆子
await app.request('/api/beads', {
  method: 'POST',
  data: {
    colorCode: 'A1',
    colorName: '淡黄',
    quantity: 100,
    alertThreshold: 10
  }
});

// 更新豆子
await app.request(`/api/beads/${beadId}`, {
  method: 'PUT',
  data: { quantity: 150 }
});

// 删除豆子
await app.request(`/api/beads/${beadId}`, {
  method: 'DELETE'
});
```

### 图纸管理页 (pages/patterns/)

**功能需求：**
- 显示图纸列表
- 上传图纸（拍照或相册）
- 编辑图纸信息
- 删除图纸
- 标记完成状态
- 记录用豆量

**API 调用示例：**

```javascript
// 获取图纸列表
const patterns = await app.request('/api/patterns');

// 添加图纸（需要先将图片转为 base64）
await app.request('/api/patterns', {
  method: 'POST',
  data: {
    name: '樱花图纸',
    imageUrl: 'data:image/png;base64,...',
    thumbnailUrl: 'data:image/png;base64,...',
    status: 'planned'
  }
});
```

### 设置页 (pages/settings/)

**功能需求：**
- 显示用户信息
- 退出登录
- 数据同步状态
- 关于页面

## 🎨 UI 设计建议

### 配色方案

```css
主色：#3b82f6 (蓝色)
辅助色：#667eea (紫蓝色)
成功：#10b981 (绿色)
警告：#f59e0b (橙色)
错误：#ef4444 (红色)
文字：#111827 (深灰)
背景：#f5f5f5 (浅灰)
```

### 组件复用

创建通用组件：
- `components/bead-card/` - 豆子卡片
- `components/pattern-card/` - 图纸卡片
- `components/empty-state/` - 空状态提示
- `components/loading/` - 加载动画

## 📸 图片处理

### 上传图纸图片

```javascript
// 选择图片
wx.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0];
    // 转换为 base64
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (data) => {
        const base64 = 'data:image/jpeg;base64,' + data.data;
        // 上传到服务器
        uploadPattern(base64);
      }
    });
  }
});
```

### 生成缩略图

可以使用 Canvas API 生成缩略图：

```javascript
const ctx = wx.createCanvasContext('myCanvas');
ctx.drawImage(imagePath, 0, 0, 200, 200);
ctx.draw(false, () => {
  wx.canvasToTempFilePath({
    canvasId: 'myCanvas',
    success: (res) => {
      // res.tempFilePath 就是缩略图
    }
  });
});
```

## 🔐 认证流程

```
用户打开小程序
    ↓
检查 Storage 中的 token
    ↓
   有 token？
   ├─ 是 → 验证 token 有效性 → 进入主页
   └─ 否 → 跳转登录页
```

## 🌐 网络请求配置

### 请求超时设置

```javascript
wx.request({
  url: API_BASE_URL + '/api/beads',
  timeout: 10000, // 10秒超时
  success: (res) => {
    // 处理成功
  },
  fail: (err) => {
    wx.showToast({
      title: '网络请求失败',
      icon: 'none'
    });
  }
});
```

### 错误处理

建议在 `app.js` 的 `request` 方法中统一处理错误：

```javascript
request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: this.globalData.apiBaseUrl + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(this.globalData.token && {
          Authorization: `Bearer ${this.globalData.token}`
        })
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 失效，重新登录
          this.logout();
          reject(new Error('登录已过期，请重新登录'));
        } else {
          reject(new Error(res.data.error || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络连接失败'));
      }
    });
  });
}
```

## 📊 数据缓存策略

### 本地缓存 + 云端同步

```javascript
// 获取数据时先从缓存读取，再请求服务器
async loadBeads() {
  // 1. 先读取缓存
  const cachedBeads = wx.getStorageSync('beads');
  if (cachedBeads) {
    this.setData({ beads: cachedBeads });
  }

  // 2. 请求服务器
  try {
    const beads = await app.request('/api/beads');
    this.setData({ beads });
    // 3. 更新缓存
    wx.setStorageSync('beads', beads);
  } catch (error) {
    console.error('加载失败:', error);
  }
}
```

## 🎯 开发优先级建议

### 第一阶段（核心功能）
1. ✅ 登录注册页面（已完成）
2. 豆子列表页面
3. 豆子添加/编辑
4. 图纸列表页面

### 第二阶段（增强功能）
5. 图纸上传
6. 用量记录
7. 搜索和筛选
8. 低库存提醒

### 第三阶段（优化体验）
9. 下拉刷新
10. 上拉加载更多
11. 离线缓存
12. 数据统计

## 🐛 常见问题

### 1. 网络请求失败

**问题**: `request:fail`

**解决**:
- 检查小程序后台是否配置了服务器域名
- 开发时勾选"不校验合法域名"
- 确认后端 API 可以访问

### 2. 跨域问题

小程序不存在跨域问题，但要确保后端配置了 CORS。

### 3. HTTPS 要求

小程序正式环境必须使用 HTTPS。开发环境可以使用 HTTP。

配置 HTTPS 请参考 `BACKEND_USAGE.md` 的"配置域名"章节。

### 4. 图片上传失败

**问题**: 图片太大导致上传失败

**解决**:
- 使用压缩图片 (`sizeType: ['compressed']`)
- 限制图片大小
- 生成缩略图

## 📚 参考资料

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [拼豆豆后端 API 文档](../BACKEND_USAGE.md)
- [小程序 Canvas API](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/wx.createCanvasContext.html)

## 🆘 获取帮助

遇到问题？

1. 查看微信开发者工具控制台
2. 检查后端 API 日志：`docker-compose logs api`
3. 在 GitHub 提交 Issue

---

**开发提示**：
- 小程序页面大小限制为 2MB，注意代码分包
- 使用 `wx:if` 而不是 `hidden` 来提升性能
- 图片资源建议使用 CDN
- 定期测试真机效果

祝开发顺利！🚀
