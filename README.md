# Reddit AI 情报系统

> 仓库地址：https://github.com/nutllwhy/reddit-AI
> 创建时间：2026-02-01
> 负责人：栗噔噔

---

## 📋 系统概述

**任务名称**：Reddit AI 情报监控系统
**执行频率**：每日定时扫描 + 重大事件实时推送
**输出目标**：筛选Reddit热门讨论，提取有价值的AI投资/科技情报

---

## 🔍 监控目标

### 核心 AI 社区（每日监控）

| Subreddit | 订阅数 | 内容类型 | 监控重点 |
|-----------|--------|----------|----------|
| **r/artificial** | 1.5M+ | 通用 AI 新闻 | 热门帖子（Top of the day）|
| **r/MachineLearning** | 3.2M+ | 学术/技术 | 研究论文、技术突破 |
| **r/OpenAI** | 800K+ | OpenAI 专属 | 产品更新、ChatGPT 动态 |
| **r/LocalLLaMA** | 500K+ | 本地模型 | 开源模型、工具推荐 |
| **r/singularity** | 300K+ | AGI 讨论 | 行业趋势、未来预测 |

### 补充社区（每周监控）

| Subreddit | 内容类型 |
|-----------|----------|
| **r/ChatGPT** | ChatGPT 使用技巧、案例 |
| **r/StableDiffusion** | AI 绘画、图像生成 |
| **r/ClaudeAI** | Anthropic Claude 动态 |
| **r/GoogleBard** | Google AI 产品 |
| **r/AIAssisted** | AI 工具实际应用 |

---

## 📊 内容筛选标准

### 选取标准（满足其一即可）

```
✅ 热度标准：
   - Upvotes ≥ 500（大社区）/ ≥ 200（小社区）
   - 评论数 ≥ 50

✅ 内容标准：
   - 官方公告/产品发布
   - 重大技术突破
   - 独家爆料/泄露
   - 高质量深度分析

✅ 时效标准：
   - 过去 24 小时内发布
   - 仍在上升趋势（每小时新增 upvotes > 20）
```

### 排除标准（满足任一即排除）

```
❌ 重复内容：已有相同话题的热门帖
❌ 纯吐槽：无实质信息的抱怨帖
❌ 低质量：标题党、无来源的传闻
❌ 已报道：本周已在日报中写过
```

---

## 📤 推送格式

### 实时情报（飞书推送）
```
🔥 【Reddit热帖预警】

📍 来源：r/artificial
📈 热度：24h内↑800%

💬 讨论主题：
[帖子标题]

📊 关键数据：
• Upvotes: X,XXX
• 评论数: XXX
• 社区情绪：乐观/质疑/热议

💡 情报价值：★★★☆☆
（可能影响...，建议关注）
```

### 日报汇总（晚上9点）
```
📰 【Reddit情报日报】2026-02-01

🔥 今日热帖TOP3：
1. [科技] ...
2. [投资] ...
3. [中国] ...

📈 趋势观察：
• AI板块讨论热度持续
• 黄金投资关注度上升
• 港股情绪略有回暖
```

---

## ⏰ 执行时间表

| 时间 | 任务 | 说明 |
|------|------|------|
| 09:00 | 早盘情报 | 美股隔夜讨论 |
| 13:00 | 午盘情报 | 午间热点 |
| 15:00 | 收盘情报 | 当日总结 |
| 21:00 | 日报汇总 | 全天情报整理 |
| 实时 | 突发预警 | 热度异常时立即推送 |

---

## 🔧 技术实现

### RSS订阅方案（推荐）
```
r/artificial Top Daily RSS:
https://www.reddit.com/r/artificial/top/.rss?t=day

r/MachineLearning Top Daily RSS:
https://www.reddit.com/r/MachineLearning/top/.rss?t=day

格式：https://www.reddit.com/r/{subreddit}/top/.rss?t=day
```

### 文件结构
```
reddit-AI/
├── README.md                  # 本文件
├── config.json               # 监控配置
├── daily/                    # 每日情报归档
│   ├── 2026-02-01.md
│   └── 2026-02-02.md
├── scripts/
│   ├── fetch_reddit.sh      # 抓取脚本
│   └── generate_digest.sh   # 生成日报
└── data/
    ├── tracked_posts.json   # 追踪的帖子
    └── alerts_history.json  # 预警记录
```

---

## 🔄 恢复指南

如果失忆，按以下步骤恢复：
1. 读取本配置文件
2. 检查daily/目录是否存在
3. 询问用户是否需要重新配置监控列表
4. 恢复定时任务

---

*最后更新：2026-02-01*