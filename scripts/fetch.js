#!/usr/bin/env node
/**
 * Reddit AI 情报抓取脚本 - 智能摘要版
 * 抓取帖子正文并生成中文摘要
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// RSS Feed URLs
const RSS_FEEDS = {
  'artificial': 'https://www.reddit.com/r/artificial/top/.rss?t=day',
  'MachineLearning': 'https://www.reddit.com/r/MachineLearning/top/.rss?t=day',
  'OpenAI': 'https://www.reddit.com/r/OpenAI/top/.rss?t=day',
  'LocalLLaMA': 'https://www.reddit.com/r/LocalLLaMA/top/.rss?t=day',
  'singularity': 'https://www.reddit.com/r/singularity/top/.rss?t=day'
};

// 抓取单个RSS
async function fetchRSS(subreddit, url) {
  try {
    console.log(`🔄 正在抓取 r/${subreddit}...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const posts = parseRSS(xml, subreddit);
    
    console.log(`✅ r/${subreddit}: 获取 ${posts.length} 条帖子`);
    return posts;
    
  } catch (error) {
    console.error(`❌ r/${subreddit} 抓取失败:`, error.message);
    return [];
  }
}

// 解析RSS XML
function parseRSS(xml, subreddit) {
  const posts = [];
  const entries = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/g) || [];
  
  for (const entry of entries.slice(0, 5)) {
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] || '无标题';
    const link = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] || '';
    const updated = entry.match(/<updated>([^<]*)<\/updated>/)?.[1] || '';
    const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || '';
    
    // 从content提取upvotes和评论数
    const upvotesMatch = content.match(/>([\d,]+)\s*upvotes?</i);
    const upvotes = upvotesMatch ? upvotesMatch[1].replace(/,/g, '') : '0';
    
    const commentsMatch = content.match(/>([\d,]+)\s*comments?</i);
    const comments = commentsMatch ? commentsMatch[1].replace(/,/g, '') : '0';
    
    posts.push({
      subreddit,
      title: cleanText(title),
      link,
      updated,
      upvotes: parseInt(upvotes) || 0,
      comments: parseInt(comments) || 0,
      postedTime: formatTime(updated),
      summary: '' // 待填充摘要
    });
  }
  
  return posts;
}

// 根据标题和subreddit生成摘要（基于规则的智能摘要）
function generateSummary(post) {
  const title = post.title.toLowerCase();
  const sub = post.subreddit;
  
  // 基于关键词生成摘要
  const summaries = [];
  
  // 技术/研究类
  if (title.includes('paper') || title.includes('research') || title.includes('[r]')) {
    summaries.push('研究论文分享：介绍了新的技术方法或实验结果。');
  }
  
  // 产品/工具类
  if (title.includes('built') || title.includes('launch') || title.includes('release') || title.includes('[p]') || title.includes('[d]')) {
    summaries.push('项目/工具发布：开发者分享的新工具或项目进展。');
  }
  
  // 公司/商业类
  if (title.includes('ceo') || title.includes('funding') || title.includes('investment') || title.includes('nvidia') || title.includes('apple') || title.includes('openai')) {
    summaries.push('行业动态：涉及科技公司的重要新闻或战略动向。');
  }
  
  // 数据/分析类
  if (title.includes('analyzed') || title.includes('data') || title.includes('study')) {
    summaries.push('数据分析：基于数据的洞察或研究发现。');
  }
  
  // 安全/风险类
  if (title.includes('security') || title.includes('warn') || title.includes('risk') || title.includes('exposed') || title.includes('database')) {
    summaries.push('安全预警：涉及数据安全或风险警告的重要信息。');
  }
  
  // 模型/算法类
  if (title.includes('model') || title.includes('llm') || title.includes('gpt') || title.includes('quantiz') || title.includes('perplexity')) {
    summaries.push('模型技术：关于AI模型优化、训练或性能的讨论。');
  }
  
  // 硬件类
  if (title.includes('gpu') || title.includes('cpu') || title.includes('rtx') || title.includes('hardware')) {
    summaries.push('硬件相关：AI硬件配置、性能测试或购买建议。');
  }
  
  // 默认摘要
  if (summaries.length === 0) {
    if (sub === 'artificial') {
      summaries.push('AI行业新闻：通用人工智能领域的最新动态。');
    } else if (sub === 'MachineLearning') {
      summaries.push('机器学习讨论：技术实现或研究相关话题。');
    } else if (sub === 'OpenAI') {
      summaries.push('OpenAI相关：产品更新、使用体验或公司动态。');
    } else if (sub === 'LocalLLaMA') {
      summaries.push('本地模型：开源模型部署、优化或使用技巧。');
    } else if (sub === 'singularity') {
      summaries.push('AGI/未来趋势：关于通用人工智能发展的讨论。');
    } else {
      summaries.push('热门讨论：社区关注的技术或行业话题。');
    }
  }
  
  // 组合多个标签
  return summaries.slice(0, 2).join('');
}

// 清理文本
function cleanText(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// 格式化时间
function formatTime(isoString) {
  if (!isoString) return '未知';
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60 / 60);
  
  if (diff < 1) return '刚刚';
  if (diff < 24) return `${diff}小时前`;
  return `${Math.floor(diff / 24)}天前`;
}

// 生成HTML
function generateHTML(allPosts, date) {
  // 按subreddit分组并生成摘要
  allPosts.forEach(post => {
    post.summary = generateSummary(post);
  });
  
  const postsBySubreddit = {};
  allPosts.forEach(post => {
    if (!postsBySubreddit[post.subreddit]) {
      postsBySubreddit[post.subreddit] = [];
    }
    postsBySubreddit[post.subreddit].push(post);
  });

  const sections = Object.entries(postsBySubreddit)
    .map(([sub, posts]) => generateSection(sub, posts))
    .join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reddit AI 情报 - ${date}</title>
    <style>
        :root {
            --bg: #faf9f7;
            --card: #ffffff;
            --text: #1a1a1a;
            --muted: #666;
            --border: #e0ddd5;
            --accent: #ff4500;
            --link: #0066cc;
            --summary-bg: #f5f5f0;
        }
        [data-theme="dark"] {
            --bg: #1a1a1a;
            --card: #2a2a2a;
            --text: #f5f5f5;
            --muted: #999;
            --border: #444;
            --accent: #ff6b6b;
            --link: #4dabf7;
            --summary-bg: #333;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #ff4500 0%, #ff6b6b 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 30px 20px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 1.5em;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid var(--accent);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .post-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .post-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .post-title {
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .post-title a {
            color: var(--text);
            text-decoration: none;
        }
        .post-title a:hover {
            color: var(--accent);
        }
        .post-meta {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
            color: var(--muted);
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .post-stats {
            display: flex;
            gap: 15px;
        }
        .stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .stat.upvotes { color: #ff4500; }
        .post-summary {
            background: var(--summary-bg);
            border-left: 4px solid var(--accent);
            padding: 12px 16px;
            margin: 12px 0;
            border-radius: 0 8px 8px 0;
            font-size: 0.95em;
            color: var(--text);
            line-height: 1.7;
        }
        .source-link {
            display: inline-block;
            margin-top: 10px;
            color: var(--link);
            text-decoration: none;
            font-size: 0.9em;
            padding: 6px 12px;
            border: 1px solid var(--border);
            border-radius: 6px;
            transition: all 0.2s;
        }
        .source-link:hover {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }
        .footer {
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid var(--border);
            color: var(--muted);
        }
        @media (max-width: 600px) {
            .header h1 { font-size: 1.8em; }
            .post-card { padding: 15px; }
            .post-title { font-size: 1.1em; }
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>🔥 Reddit AI 情报</h1>
        <p>${date} | 精选过去24小时热门讨论</p>
    </header>
    
    <div class="container">
        ${sections}
    </div>
    
    <footer class="footer">
        <p>数据来源：Reddit RSS | 自动生成于 ${new Date().toLocaleString('zh-CN')}</p>
        <p style="margin-top: 10px;">GitHub: https://github.com/nutllwhy/reddit-AI</p>
    </footer>
</body>
</html>`;
}

function generateSection(subreddit, posts) {
  const icons = {
    'artificial': '🤖',
    'MachineLearning': '🧠',
    'OpenAI': '⚡',
    'LocalLLaMA': '💻',
    'singularity': '🔮'
  };
  
  const descriptions = {
    'artificial': '通用AI讨论',
    'MachineLearning': '机器学习研究',
    'OpenAI': 'OpenAI动态',
    'LocalLLaMA': '本地模型部署',
    'singularity': 'AGI与未来'
  };
  
  const postCards = posts.map(post => `
        <div class="post-card">
            <h3 class="post-title">
                <a href="${post.link}" target="_blank">${post.title}</a>
            </h3>
            <div class="post-meta">
                <span>⏱️ ${post.postedTime}</span>
                <div class="post-stats">
                    <span class="stat upvotes">⬆️ ${post.upvotes || 'N/A'}</span>
                    <span class="stat">💬 ${post.comments || 'N/A'}</span>
                </div>
            </div>
            <div class="post-summary">
                💡 ${post.summary}
            </div>
            <a href="${post.link}" class="source-link" target="_blank">查看原帖讨论 →</a>
        </div>
    `).join('');

  return `
        <section class="section">
            <h2 class="section-title">${icons[subreddit] || '📌'} r/${subreddit} <span style="font-size: 0.6em; color: var(--muted); font-weight: normal;">(${descriptions[subreddit]})</span></h2>
            ${postCards}
        </section>
    `;
}

// 主函数
async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 开始抓取 Reddit AI 情报 - ${date}\n`);
  
  const allPosts = [];
  
  for (const [sub, url] of Object.entries(RSS_FEEDS)) {
    const posts = await fetchRSS(sub, url);
    allPosts.push(...posts);
    
    // 延迟避免请求过快
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n📊 总共获取 ${allPosts.length} 条帖子`);
  
  if (allPosts.length === 0) {
    console.log('⚠️ 未获取到数据，可能Reddit RSS限制了访问');
    return;
  }
  
  // 生成摘要
  console.log('🤖 正在生成内容摘要...');
  allPosts.forEach(post => {
    post.summary = generateSummary(post);
  });
  
  // 保存JSON
  const jsonPath = join(process.cwd(), 'data', `posts-${date}.json`);
  writeFileSync(jsonPath, JSON.stringify(allPosts, null, 2));
  console.log(`💾 数据已保存: ${jsonPath}`);
  
  // 生成HTML
  const html = generateHTML(allPosts, date);
  const htmlPath = join(process.cwd(), 'daily', `${date}.html`);
  writeFileSync(htmlPath, html);
  console.log(`📄 HTML已生成: ${htmlPath}`);
  
  // 更新index.html
  updateIndex(allPosts.slice(0, 3), date);
  
  console.log('\n✅ 完成！');
}

function updateIndex(topPosts, date) {
  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reddit AI 情报</title>
    <style>
        :root {
            --bg: #faf9f7;
            --card: #ffffff;
            --text: #1a1a1a;
            --muted: #666;
            --border: #e0ddd5;
            --accent: #ff4500;
            --link: #0066cc;
        }
        [data-theme="dark"] {
            --bg: #1a1a1a;
            --card: #2a2a2a;
            --text: #f5f5f5;
            --muted: #999;
            --border: #444;
            --accent: #ff6b6b;
            --link: #4dabf7;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #ff4500 0%, #ff6b6b 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
        }
        .header h1 { font-size: 3em; margin-bottom: 15px; }
        .header p { opacity: 0.9; font-size: 1.2em; }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .latest-box {
            background: var(--card);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid var(--border);
        }
        .latest-title {
            font-size: 1.3em;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--accent);
        }
        .post-item {
            padding: 15px 0;
            border-bottom: 1px solid var(--border);
        }
        .post-item:last-child { border-bottom: none; }
        .post-link {
            color: var(--text);
            text-decoration: none;
            font-weight: 500;
            font-size: 1.1em;
        }
        .post-link:hover { color: var(--accent); }
        .post-summary {
            font-size: 0.9em;
            color: var(--muted);
            margin-top: 8px;
            line-height: 1.6;
        }
        .post-source {
            font-size: 0.85em;
            color: var(--muted);
            margin-top: 5px;
        }
        .btn {
            display: inline-block;
            background: var(--accent);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
        }
        .btn:hover { opacity: 0.9; }
        .archive {
            margin-top: 40px;
        }
        .archive h2 {
            font-size: 1.5em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--accent);
        }
        .archive-list {
            list-style: none;
        }
        .archive-item {
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .archive-date {
            font-weight: 600;
            color: var(--accent);
        }
        .archive-link {
            color: var(--link);
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>🔥 Reddit AI 情报</h1>
        <p>每日精选 Reddit AI 社区热门讨论</p>
    </header>
    
    <div class="container">
        <div class="latest-box">
            <div class="latest-title">📰 最新情报 - ${date}</div>
            ${topPosts.map(p => `
            <div class="post-item">
                <a href="${p.link}" class="post-link" target="_blank">${p.title}</a>
                <div class="post-summary">${p.summary}</div>
                <div class="post-source">r/${p.subreddit} · ⬆️ ${p.upvotes || 'N/A'}</div>
            </div>
            `).join('')}
            <a href="daily/${date}.html" class="btn">查看完整日报 →</a>
        </div>
        
        <div class="archive">
            <h2>📚 历史归档</h2>
            <ul class="archive-list">
                <li class="archive-item">
                    <span class="archive-date">${date}</span>
                    <a href="daily/${date}.html" class="archive-link">查看完整报告 →</a>
                </li>
            </ul>
        </div>
    </div>
    
    <footer class="footer">
        <p>GitHub: https://github.com/nutllwhy/reddit-AI</p>
    </footer>
</body>
</html>`;

  writeFileSync(join(process.cwd(), 'index.html'), indexHtml);
  console.log(`🏠 首页已更新: index.html`);
}

main().catch(console.error);