#!/bin/bash
cd "$(dirname "$0")"

echo "🔨 构建项目..."
npm run build

echo "📦 生成单文件版本..."
cd dist

# 开始HTML
cat > ../pindou-manager-standalone.html << 'EOF'
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🎨 拼豆管理系统</title>
    <style>
EOF

# 添加CSS
cat assets/*.css >> ../pindou-manager-standalone.html

# 关闭style，开始body
cat >> ../pindou-manager-standalone.html << 'EOF'
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
EOF

# 添加JS
cat assets/*.js >> ../pindou-manager-standalone.html

# 关闭HTML
cat >> ../pindou-manager-standalone.html << 'EOF'
    </script>
</body>
</html>
EOF

cd ..
echo "✅ 完成！文件大小："
ls -lh pindou-manager-standalone.html
echo ""
echo "验证内容..."
grep -c "设置" pindou-manager-standalone.html
grep -c "SettingsPanel\|主题\|导入\|导出" pindou-manager-standalone.html
