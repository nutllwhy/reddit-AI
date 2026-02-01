#!/bin/bash
# Reddit AI 情报自动抓取脚本
# 每天早上7:00运行，抓取TOP5并推送到GitHub

echo "================================"
echo "🤖 Reddit AI 情报自动抓取"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
echo ""

cd /root/.openclaw/workspace/reddit-AI

# 1. 运行Node抓取脚本
echo "🔄 Step 1: 抓取Reddit数据..."
node scripts/fetch.js

if [ $? -ne 0 ]; then
    echo "❌ 抓取失败，退出"
    exit 1
fi

echo ""
echo "✅ 抓取完成"
echo ""

# 2. Git提交和推送
echo "🔄 Step 2: 推送到GitHub..."

# 检查是否有变更
if [ -n "$(git status --porcelain)" ]; then
    DATE=$(date '+%Y-%m-%d')
    git add -A
    git commit -m "Auto: Daily Reddit Intel ${DATE}"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ 已成功推送到GitHub"
        echo "🌐 访问: https://nutllwhy.github.io/reddit-AI/"
    else
        echo "❌ Git推送失败"
        exit 1
    fi
else
    echo "⚠️ 没有新内容需要提交"
fi

echo ""
echo "================================"
echo "✨ 任务完成！"
echo "下次运行: 明天 07:00"
echo "================================"