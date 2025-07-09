#!/bin/bash

# GitHub Pages 部署腳本 - 處理衝突
echo "🚀 開始部署到 GitHub Pages..."

# 清理舊的建置文件
echo "🧹 清理舊文件..."
rm -rf dist/
rm -rf node_modules/.cache/gh-pages

# 建置專案
echo "🔨 建置專案..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 建置失敗！"
    exit 1
fi

# 強制部署到 gh-pages 分支
echo "📤 部署到 gh-pages 分支..."
npx gh-pages -d dist -f

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 網站將在 1-3 分鐘內更新："
    echo "   https://iim0663418.github.io/Partner-Store-Project/"
else
    echo "❌ 部署失敗！"
    exit 1
fi