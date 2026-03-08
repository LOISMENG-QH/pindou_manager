# 📖 使用指南

## 🎯 快速上手

### 豆子管理

1. **添加色号**
   - 点击「添加色号」按钮
   - 输入色号（如 H01）和颜色名称（如 红色）
   - 设置当前数量和提醒阈值
   - 点击保存

2. **调整数量**
   - 使用 `+` `-` 按钮快速增减数量
   - 点击编辑按钮修改详细信息

3. **库存提醒**
   - 当豆子数量 ≤ 提醒阈值时，会显示黄色提醒
   - 顶部显示所有低库存色号

### 图纸管理

1. **上传图纸**
   - 点击「添加图纸」
   - 点击上传区域选择图片
   - 输入图纸名称和描述
   - 点击保存

2. **查看图纸**
   - 点击缩略图查看完整图片
   - 支持全屏查看

3. **删除图纸**
   - 鼠标悬停在图纸卡片上
   - 点击右上角垃圾桶图标

## 🔧 部署到 GitHub

### 方法一：使用自动脚本（推荐）

```bash
# 在项目目录运行
./deploy.sh
```

按提示输入你的 GitHub 仓库地址即可。

### 方法二：手动部署

1. **修改配置**

编辑 `vite.config.ts`：
```typescript
base: '/你的仓库名/',  // 如: '/pindou-manager/'
```

2. **初始化 Git**

```bash
git init
git add .
git commit -m "Initial commit"
```

3. **推送到 GitHub**

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

4. **部署**

```bash
npm run deploy
```

5. **启用 GitHub Pages**

- 进入仓库 Settings → Pages
- Source 选择 `gh-pages` 分支
- 保存

### 方法三：使用 GitHub Actions（自动化）

项目已配置 `.github/workflows/deploy.yml`，推送代码后会自动构建部署。

需要在仓库设置中启用：
- Settings → Pages → Source 选择 `GitHub Actions`

## 💡 常见问题

### Q: 数据会丢失吗？
A: 数据存储在浏览器本地（IndexedDB），除非清除浏览器数据，否则永久保存。

### Q: 可以在手机上使用吗？
A: 可以！界面完全响应式，手机、平板、电脑都能用。

### Q: 图片存储有限制吗？
A: IndexedDB 通常有几百MB到几GB的容量，日常使用足够。建议单张图片不超过5MB。

### Q: 可以导出数据吗？
A: 目前版本暂不支持，未来可添加导入导出功能。

### Q: 可以多设备同步吗？
A: 目前不支持，每个设备的数据独立。未来可考虑添加云同步功能。

## 🎨 自定义

### 修改主题色

编辑 `src/App.css` 和组件 CSS 文件中的颜色值：

```css
/* 主色调 */
#1976d2  /* 蓝色 */

/* 可以替换为你喜欢的颜色 */
```

### 添加新功能

项目使用 React + TypeScript，代码结构清晰：

- `src/types.ts` - 数据类型定义
- `src/db.ts` - 数据库配置
- `src/components/` - UI 组件
- `src/App.tsx` - 主应用

## 📞 获取帮助

遇到问题？
1. 查看 README.md
2. 检查浏览器控制台是否有错误
3. 在 GitHub 提交 Issue

祝你玩拼豆愉快！🎉
