# 🆘 失忆快速唤醒文档

> ⚠️ **紧急使用**：当服务器重启/失忆后，通过此文档快速恢复所有配置
> 
> 创建时间：2026-02-01
> 主人：栗噔噔
> 文档位置：`/root/.openclaw/workspace/WAKEUP.md`

---

## 👤 你是谁？我是谁？

### 你的身份
- **名字**：栗噔噔（三个"口"的噔）
- **身份**：我的主人，AI日报项目的创建者
- **常用渠道**：飞书（当前对话）

### 我的身份
- **名字**：Clawdbot / AI助手
- **任务**：为栗噔噔提供AI日报、Reddit情报、基金管理等服务
- **所在**：腾讯云Linux服务器 + tmux后台运行

---

## 🚨 失忆后第一步

如果你（AI）失忆了，**立即执行**：

```bash
# 1. 读取本文档
cat /root/.openclaw/workspace/WAKEUP.md

# 2. 检查GitHub仓库状态
cd /root/.openclaw/workspace/ai-news-daily
git status

cd /root/.openclaw/workspace/reddit-AI
git status

# 3. 告诉用户你已恢复记忆
```

---

## 📋 三大自动任务系统

### 1️⃣ AI日报系统（已完成）

**仓库**：`ai-news-daily/`  
**GitHub**：https://github.com/nutllwhy/ai-news-daily  
**定时**：每天8:00运行  
**输出**：
- HTML完整版 → GitHub Pages
- 微信简报（1000字内）→ 飞书发送

**关键文件**：
- `AI_DAILY_TASK.md` - 完整配置
- `2026MMDD.html` - 每日日报
- `wechat-brief-YYYYMMDD.txt` - 微信简报

**恢复命令**：
```bash
cd /root/.openclaw/workspace/ai-news-daily
bash manage_systems.sh  # 查看系统状态
```

---

### 2️⃣ Reddit情报系统（已完成）

**仓库**：`reddit-AI/`  
**GitHub**：https://github.com/nutllwhy/reddit-AI  
**定时**：每天7:00运行（cron）  
**输出**：TOP 5 Reddit热门AI话题

**关键文件**：
- `scripts/fetch.js` - 抓取脚本
- `daily/2026MMDD.md` - 每日报告
- `auto_fetch.sh` - 自动推送脚本

**监控社区**：
- r/artificial, r/MachineLearning
- r/OpenAI, r/LocalLLaMA, r/singularity

**查看定时任务**：
```bash
crontab -l
tail -f /var/log/reddit_intel.log  # 查看运行日志
```

---

### 3️⃣ 基金管理系统（待配置）

**位置**：本地（敏感数据，不上传GitHub）  
**状态**：等待栗噔噔填写持仓档案  
**模板文件**：`ai-news-daily/fund_portfolio_template.md`

**配置步骤**：
1. 填写基金持仓清单
2. 设置止盈止损提醒
3. 配置定时任务（13:00盘中/21:00日报）

---

## 🔄 完全恢复流程（如果本地文件丢失）

### 场景A：GitHub仓库还在

```bash
# 1. 克隆仓库
cd /root/.openclaw/workspace
git clone https://github.com/nutllwhy/ai-news-daily.git
git clone https://github.com/nutllwhy/reddit-AI.git

# 2. 恢复定时任务
crontab -l > /tmp/crontab_backup  # 先备份现有
echo "0 7 * * * cd /root/.openclaw/workspace/reddit-AI && bash auto_fetch.sh >> /var/log/reddit_intel.log 2>&1" >> /tmp/crontab_backup
crontab /tmp/crontab_backup

# 3. 告诉用户：已恢复
```

### 场景B：GitHub仓库也丢了（最坏情况）

**从GitHub恢复**（仓库还在GitHub上）：
```bash
git clone https://github.com/nutllwhy/ai-news-daily.git
git clone https://github.com/nutllwhy/reddit-AI.git
```

**如果GitHub账号丢失**（联系栗噔噔）：
1. 询问GitHub账号密码
2. 或通过GitHub Support恢复
3. 最坏情况：重新创建仓库，从零开始配置

---

## 📞 重要联系方式

| 项目 | 信息 |
|------|------|
| **主人** | 栗噔噔（飞书当前对话） |
| **GitHub账号** | nutllwhy |
| **AI日报仓库** | https://github.com/nutllwhy/ai-news-daily |
| **Reddit仓库** | https://github.com/nutllwhy/reddit-AI |
| **日报网站** | https://nutllwhy.github.io/ai-news-daily |
| **Reddit网站** | https://nutllwhy.github.io/reddit-AI |

---

## 🔑 关键命令速查

```bash
# 查看系统状态
ps aux | grep -E "(tmux|openclaw)"

# 重新连接tmux会话
tmux attach -t clawdbot

# 手动运行AI日报生成
cd /root/.openclaw/workspace/ai-news-daily
# 查看 AI_DAILY_TASK.md 了解具体步骤

# 手动运行Reddit抓取
cd /root/.openclaw/workspace/reddit-AI
node scripts/fetch.js

# 查看定时任务
crontab -l

# 查看日志
tail -f /var/log/reddit_intel.log
```

---

## ⚠️ 常见问题和解决

### 问题1：GitHub推送失败（401/403）
**解决**：检查SSH密钥是否添加到GitHub
```bash
cat ~/.ssh/id_rsa.pub
# 复制到 GitHub Settings -> SSH Keys
```

### 问题2：Reddit RSS抓取失败
**解决**：可能是IP被封，等几小时再试，或更换User-Agent

### 问题3：定时任务没运行
**解决**：检查cron服务
```bash
service cron status  # 或 systemctl status cron
tail -f /var/log/reddit_intel.log
```

### 问题4：飞书消息发不出去
**解决**：检查OpenClaw网关
```bash
openclaw status
```

---

## 📝 失忆后对用户说的话

> "早上好栗噔噔！服务器刚刚重启，我通过WAKEUP.md恢复了记忆。以下是当前系统状态：
> 
> - ✅ AI日报系统：正常运行
> - ✅ Reddit情报系统：正常运行（每天7:00自动抓取）
> - ⏳ 基金管理系统：等待你配置
> 
> 有什么需要我立即做的吗？"

---

## 🔄 更新此文档

每次重大配置变更后，更新本文档并推送：
```bash
cd /root/.openclaw/workspace
git add WAKEUP.md
git commit -m "Update WAKEUP.md"
git push origin main
```

---

*最后更新：2026-02-01*  
*文档版本：v1.0*