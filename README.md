# 🎨 拼豆管理系统

一个简洁美观的拼豆（Perler Beads）管理网页应用，支持豆子库存管理、图纸存储和低库存提醒。

## ✨ 功能特性

- **豆子管理**
  - 添加/编辑/删除豆子色号
  - 实时数量调整（+/-按钮）
  - 设置库存提醒阈值
  - 低库存自动提醒

- **图纸管理**
  - 上传拼豆图纸图片
  - 自动生成缩略图
  - 全屏查看图纸
  - 添加图纸描述

- **数据存储**
  - 使用 IndexedDB 本地存储
  - 数据永久保存（除非清除浏览器数据）
  - 支持图片完整保存

- **响应式设计**
  - 适配手机、平板、电脑
  - 简洁美观的界面

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 📦 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 上创建一个新仓库，例如 `pindou-manager`

### 2. 修改配置

编辑 `vite.config.ts`，将 `base` 改为你的仓库名：

```typescript
export default defineConfig({
  base: '/你的仓库名/',  // 例如: '/pindou-manager/'
  // ...
})
```

### 3. 推送代码

```bash
# 初始化 git
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 4. 部署

```bash
# 一键部署到 gh-pages 分支
npm run deploy
```

### 5. 启用 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. Source 选择 `gh-pages` 分支
3. 点击 Save

等待几分钟后，访问 `https://你的用户名.github.io/你的仓库名/` 即可使用！

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Dexie.js** - IndexedDB 封装
- **Lucide React** - 图标库
- **CSS3** - 样式

## 📱 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- 移动端浏览器

需要支持 IndexedDB 的现代浏览器。

## 💡 使用提示

1. **数据备份**：所有数据存储在浏览器本地，清除浏览器数据会导致数据丢失。建议定期导出重要图纸。

2. **图片大小**：上传的图片会完整保存在浏览器中，建议单张图片不超过 5MB。

3. **多设备同步**：目前不支持多设备同步，每个设备的数据独立存储。

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
