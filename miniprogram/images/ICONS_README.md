# TabBar 图标说明

小程序需要以下图标资源（放在 `images/` 目录）：

## 所需图标

1. **bead.png** - 豆子图标（未选中状态）
2. **bead-active.png** - 豆子图标（选中状态）
3. **pattern.png** - 图纸图标（未选中状态）
4. **pattern-active.png** - 图纸图标（选中状态）
5. **settings.png** - 设置图标（未选中状态）
6. **settings-active.png** - 设置图标（选中状态）

## 图标规格

- **尺寸**: 81px × 81px（推荐）
- **格式**: PNG（支持透明背景）
- **颜色**:
  - 未选中: 灰色 (#666666)
  - 选中: 蓝色 (#3b82f6)

## 快速生成方式

### 方式 1: 使用 Iconfont
1. 访问 https://www.iconfont.cn/
2. 搜索相关图标（珠子、图纸、设置）
3. 下载 PNG 格式，尺寸选择 128px
4. 使用图片编辑工具调整为 81px

### 方式 2: 使用 Figma/Sketch
1. 创建 81×81 画布
2. 绘制简单图标
3. 导出为 PNG

### 方式 3: 临时方案（开发测试）
可以暂时使用纯色方块：
- 创建 81×81 的灰色/蓝色方块
- 添加文字标识（如 "豆"、"图"、"设"）

## 替换步骤

1. 准备好 6 个图标文件
2. 放入 `miniprogram/images/` 目录
3. 确保文件名与 `app.json` 中配置一致
4. 重新编译小程序即可看到效果

## 在线图标资源

- Iconfont: https://www.iconfont.cn/
- Font Awesome: https://fontawesome.com/
- Material Icons: https://fonts.google.com/icons
- Flaticon: https://www.flaticon.com/

---

**提示**: 在开发阶段，即使没有图标也不影响功能测试，TabBar 会显示文字。正式发布前再添加精美图标即可。
