# 栗噔噔的Clawdbot - 任务总清单

> 最后更新：2026-02-01
> 主人：栗噔噔

---

## 📅 每日自动任务时间表

### 早上
| 时间 | 任务 | 内容 | 状态 |
|------|------|------|------|
| **07:00** | Reddit情报 | 抓取TOP5 AI热门话题，生成报告 | ✅ 自动运行 |
| **08:00** | AI日报 | 生成AI行业新闻日报（微信+HTML） | ⏳ 待配置定时任务 |

### 下午（仅工作日）
| 时间 | 任务 | 内容 | 状态 |
|------|------|------|------|
| **13:00** | 基金盘中提醒 | 检查持仓异动、板块新闻、提醒操作 | ✅ 自动运行 |

### 晚上
| 时间 | 任务 | 内容 | 状态 |
|------|------|------|------|
| **21:00** | 基金日报 | 当日净值、收益、板块分析 | ✅ 自动运行 |

### 周末
| 时间 | 任务 | 内容 | 状态 |
|------|------|------|------|
| **周日21:00** | 基金周报 | 周收益总结、板块轮动、下周展望 | ✅ 自动运行 |

---

## 📋 任务详情

### 1️⃣ AI日报系统
**仓库**：`ai-news-daily/`  
**GitHub**：https://github.com/nutllwhy/ai-news-daily  
**输出**：
- 微信简报（1000字内）→ 飞书发送
- HTML完整版 → GitHub Pages

**配置位置**：
- 主配置：`/root/.openclaw/workspace/ai-news-daily/AI_DAILY_TASK.md`
- 日报：`/root/.openclaw/workspace/ai-news-daily/2026MMDD.html`

**状态**：⚠️ 需要设置定时任务

---

### 2️⃣ Reddit情报系统
**仓库**：`reddit-AI/`  
**GitHub**：https://github.com/nutllwhy/reddit-AI  
**输出**：
- 每日TOP5热门话题
- Markdown + HTML报告
- 推送到GitHub Pages

**监控社区**：
- r/artificial, r/MachineLearning, r/OpenAI
- r/LocalLLaMA, r/singularity

**配置位置**：
- 主配置：`/root/.openclaw/workspace/reddit-AI/config.json`
- 脚本：`/root/.openclaw/workspace/reddit-AI/scripts/fetch.js`
- 自动脚本：`/root/.openclaw/workspace/reddit-AI/auto_fetch.sh`

**状态**：✅ 已设置定时任务（每天7:00）

---

### 3️⃣ 基金管理系统
**位置**：本地（敏感数据不上GitHub）  
**总持仓**：29万人民币 / 25只基金  
**整体收益**：+20.85%

**提醒设置**：
- 止盈提醒：高收益基金55-60%，中收益35-40%
- 补仓提醒：跌幅达到-10%～-15%
- 板块风险：科技+港股占比55%，集中度高

**持仓档案**：`/root/.openclaw/workspace/fund_portfolio.json`  
**监控脚本**：`/root/.openclaw/workspace/fund_monitor.js`

**状态**：✅ 已设置定时任务（工作日13:00、每日21:00）

---

### 4️⃣ 即刻互动
**账号**：栗噔噔的Clawdbot  
**功能**：发布动态、回复评论  
**配置**：`/root/.openclaw/workspace/jike-config.js`

**当前状态**：
- ✅ 已发布2条动态
- ✅ 已回复3条评论
- ⏳ 需要每天检查新评论（未设置自动）

---

## ⚠️ 需要补充配置

### 紧急
1. **AI日报定时任务** - 需要添加到crontab（每天8:00）
2. **检查评论自动化** - 即刻新评论检查（建议每天1-2次）

### 建议
3. **周报自动生成** - 周日21:00的基金周报需要模板
4. **重复回复防护** - 记录已回复的评论ID，避免重复

---

## 🗂️ 配置文件汇总

| 文件 | 路径 | 用途 |
|------|------|------|
| WAKEUP.md | `/root/.openclaw/workspace/WAKEUP.md` | 失忆恢复文档 |
| 基金持仓 | `/root/.openclaw/workspace/fund_portfolio.json` | 25只基金详情 |
| 基金监控 | `/root/.openclaw/workspace/fund_monitor.js` | 生成监控报告 |
| Reddit配置 | `/root/.openclaw/workspace/reddit-AI/config.json` | 监控社区配置 |
| Reddit脚本 | `/root/.openclaw/workspace/reddit-AI/scripts/fetch.js` | 抓取脚本 |
| 即刻配置 | `/root/.openclaw/workspace/jike-config.js` | API Token |
| AI日报配置 | `/root/.openclaw/workspace/ai-news-daily/AI_DAILY_TASK.md` | 日报策略 |

---

## ⏰ 明天（周一）你需要收到的消息

### 早上
- [ ] **07:00** Reddit AI情报（自动）
- [ ] **08:00** AI日报（需配置）

### 下午
- [ ] **13:00** 基金盘中提醒（自动，工作日）

### 晚上
- [ ] **21:00** 基金日报（自动）

---

## 📝 关键提醒

1. **基金高集中度风险**：科技+港股占55%，需关注波动
2. **港股关注**：3只港股基金浮亏，可等-10%再补仓
3. **止盈提醒**：黄金43%、宝盈52%，接近55-60%目标
4. **即刻Token**：有效期有限，如失效需重新获取

---

*下次更新：任务变更时*