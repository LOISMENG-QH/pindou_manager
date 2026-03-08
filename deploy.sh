#!/bin/bash

# 拼豆管理系统部署脚本

echo "🎨 准备部署拼豆管理系统..."

# 检查是否已初始化 git
if [ ! -d .git ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial commit: 拼豆管理系统"
fi

# 提示用户输入 GitHub 仓库地址
echo ""
echo "请输入你的 GitHub 仓库地址（例如: https://github.com/username/pindou-manager.git）"
read -p "仓库地址: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ 仓库地址不能为空"
    exit 1
fi

# 添加远程仓库
git remote remove origin 2>/dev/null
git remote add origin "$repo_url"

# 推送代码
echo "📤 推送代码到 GitHub..."
git branch -M main
git push -u origin main

# 构建并部署
echo "🔨 构建项目..."
npm run build

echo "🚀 部署到 GitHub Pages..."
npx gh-pages -d dist

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 访问你的 GitHub 仓库"
echo "2. 进入 Settings → Pages"
echo "3. Source 选择 'gh-pages' 分支"
echo "4. 等待几分钟后访问你的网站"
echo ""
echo "🌐 你的网站地址将是："
echo "   https://你的用户名.github.io/仓库名/"
