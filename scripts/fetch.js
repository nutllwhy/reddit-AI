#!/usr/bin/env node
/**
 * Reddit AI 情报精选 - TOP 5 深度版
 * 人工筛选最有价值的5条，附带深度解读
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 监控的Subreddits
const SUBREDDITS = [
  { name: 'artificial', priority: 'high', focus: 'AI行业新闻' },
  { name: 'MachineLearning', priority: 'high', focus: '技术研究' },
  { name: 'OpenAI', priority: 'high', focus: 'OpenAI动态' },
  { name: 'LocalLLaMA', priority: 'medium', focus: '开源模型' },
  { name: 'singularity', priority: 'medium', focus: 'AGI讨论' }
];

// RSS抓取
async function fetchRSS(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/top/.rss?t=day`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    const entries = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/g) || [];
    
    return entries.slice(0, 3).map(entry => {
      const title = cleanText(entry.match(/<title>([^<]*)<\/title>/)?.[1] || '无标题');
      const link = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] || '';
      const updated = entry.match(/<updated>([^<]*)<\/updated>/)?.[1] || '';
      const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || '';
      
      const upvotesMatch = content.match(/>([\d,]+)\s*upvotes?</i);
      const upvotes = upvotesMatch ? parseInt(upvotesMatch[1].replace(/,/g, '')) : 0;
      
      return {
        subreddit,
        title,
        link,
        upvotes,
        postedTime: formatTime(updated)
      };
    });
  } catch (error) {
    console.error(`❌ r/${subreddit} 失败:`, error.message);
    return [];
  }
}

// 智能分析和筛选TOP5
function selectTop5(allPosts) {
  // 给每个帖子打分
  const scoredPosts = allPosts.map(post => {
    let score = post.upvotes || 0;
    
    // 标题关键词加分
    const title = post.title.toLowerCase();
    if (title.includes('openai') || title.includes('anthropic')) score += 50;
    if (title.includes('nvidia') || title.includes('google')) score += 40;
    if (title.includes('paper') || title.includes('research')) score += 30;
    if (title.includes('100%') || title.includes('billion')) score += 40;
    if (title.includes('breakthrough') || title.includes('new model')) score += 35;
    
    // 高优先级社区加分
    if (['artificial', 'OpenAI'].includes(post.subreddit)) score += 20;
    
    return { ...post, score };
  });
  
  // 按分数排序取TOP5
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// 为每条帖子生成深度解读
function generateAnalysis(post, rank) {
  const title = post.title.toLowerCase();
  const sub = post.subreddit;
  
  let type = '热门讨论';
  let highlight = '';
  let impact = '';
  
  // 分析类型和亮点
  if (title.includes('openai') && title.includes('funding')) {
    type = '💰 融资动态';
    highlight = '涉及OpenAI的重要资金动向，可能影响行业格局。';
    impact = '**投资影响**：关注相关AI概念股走势';
  }
  else if (title.includes('nvidia') || title.includes('jensen')) {
    type = '🏢 巨头动态';
    highlight = 'NVIDIA高层表态，影响AI芯片市场走向。';
    impact = '**行业影响**：关注GPU供应和AI基建投资';
  }
  else if (title.includes('paper') || title.includes('[r]')) {
    type = '📄 研究论文';
    highlight = '最新学术研究，可能有技术突破或新方法论。';
    impact = '**技术影响**：关注是否开源或产品化';
  }
  else if (title.includes('built') || title.includes('launch')) {
    type = '🛠️ 新工具/项目';
    highlight = '开发者分享的新项目，可能有实用价值。';
    impact = '**实用价值**：关注是否有实际应用场景';
  }
  else if (title.includes('database') || title.includes('exposed') || title.includes('security')) {
    type = '⚠️ 安全预警';
    highlight = '涉及数据安全或平台漏洞，值得关注。';
    impact = '**风险提示**：相关平台用户需注意安全';
  }
  else if (title.includes('apple') || title.includes('anthropic')) {
    type = '🍎 大厂内幕';
    highlight = '科技巨头内部动态，影响行业竞争格局。';
    impact = '**竞争影响**：关注AI应用落地进展';
  }
  else if (title.includes('moltbook') || title.includes('ai agent')) {
    type = '🔥 热门现象';
    highlight = 'AI社区热议的新现象或产品。';
    impact = '**趋势影响**：可能是下一个风口';
  }
  else if (sub === 'singularity' && (title.includes('labor') || title.includes('unemployment'))) {
    type = '⚡ 社会影响';
    highlight = 'AI对就业市场的深远影响讨论。';
    impact = '**长期关注**：政策和社会结构调整信号';
  }
  else {
    type = '💡 技术讨论';
    highlight = '社区热门技术话题，反映当前关注焦点。';
    impact = '**技术趋势**：了解开发者社区动向';
  }
  
  return { type, highlight, impact };
}

// 生成Markdown报告
function generateReport(top5, date) {
  const sections = top5.map((post, index) => {
    const analysis = generateAnalysis(post, index + 1);
    
    return `### ${['🔥','⚡','📌','💡','📝'][index]} ${index + 1}. ${post.title}
- **来源**：r/${post.subreddit} ${analysis.type}
- **热度**：⬆️ ${post.upvotes || 'N/A'} upvotes · ${post.postedTime}
- **亮点**：${analysis.highlight}
- ${analysis.impact}
🔗 **原帖**：[查看讨论](${post.link})
`;
  }).join('\n---\n\n');

  return `# 🔥 Reddit AI 情报精选 - ${date}

> 每日精选 Reddit AI 社区 **TOP 5** 热门话题
> 监控社区：r/artificial, r/OpenAI, r/MachineLearning, r/LocalLLaMA, r/singularity

---

${sections}

---

## 📊 今日情报概览

| 类别 | 数量 | 关键词 |
|------|------|--------|
| 融资/商业 | ${top5.filter(p => p.title.toLowerCase().includes('funding') || p.title.toLowerCase().includes('billion')).length} | OpenAI, NVIDIA |
| 技术研究 | ${top5.filter(p => p.title.toLowerCase().includes('paper') || p.subreddit === 'MachineLearning').length} | 论文, 模型 |
| 产品/工具 | ${top5.filter(p => p.title.toLowerCase().includes('built') || p.title.toLowerCase().includes('launch')).length} | 新项目, 工具 |
| 安全/风险 | ${top5.filter(p => p.title.toLowerCase().includes('database') || p.title.toLowerCase().includes('security')).length} | 漏洞, 预警 |

## 💭 情报价值评估

**今日亮点**：
${top5.slice(0, 2).map(p => `- ${p.title.substring(0, 50)}...`).join('\n')}

**值得关注**：
- 传统媒体可能不报道的AI社区内部动态
- 一线开发者的真实技术讨论
- 早期项目/工具的苗头

**局限性**：
- ⚠️ 需要人工筛选，质量参差不齐
- ⚠️ 看不到精确的upvotes数（RSS限制）

---

*生成时间：${new Date().toLocaleString('zh-CN')}*  
*GitHub: https://github.com/nutllwhy/reddit-AI*
`;
}

// 生成HTML版本
function generateHTML(top5, date) {
  const sections = top5.map((post, index) => {
    const analysis = generateAnalysis(post, index + 1);
    const icons = ['🔥','⚡','📌','💡','📝'];
    const colors = ['#ff4500', '#ffa500', '#4169e1', '#32cd32', '#9370db'];
    
    return `
    <div class="post-item" style="border-left: 4px solid ${colors[index]}; padding-left: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 1.5em;">${icons[index]}</span>
        <span style="background: ${colors[index]}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em;">${index + 1}</span>
      </div>
      <h3 style="font-size: 1.3em; margin-bottom: 12px; line-height: 1.4;">
        <a href="${post.link}" target="_blank" style="color: #1a1a1a; text-decoration: none;">${post.title}</a>
      </h3>
      <div style="color: #666; font-size: 0.9em; margin-bottom: 10px;">
        📍 r/${post.subreddit} · ${analysis.type} · ⬆️ ${post.upvotes || 'N/A'} · ${post.postedTime}
      </div>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 12px 0;">
        <strong style="color: ${colors[index]};">💡 亮点：</strong>${analysis.highlight}
        <br><br>
        <strong>📈 影响：</strong>${analysis.impact}
      </div>
      <a href="${post.link}" target="_blank" style="color: #0066cc; text-decoration: none; font-size: 0.9em;">🔗 查看原帖讨论 →</a>
    </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reddit AI 情报 - ${date}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #faf9f7; line-height: 1.7; }
        .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #ff4500 0%, #ff6b6b 100%); color: white; border-radius: 16px; margin-bottom: 30px; }
        .header h1 { font-size: 2.2em; margin-bottom: 10px; }
        .post-item { background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary table { width: 100%; border-collapse: collapse; }
        .summary th, .summary td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .summary th { background: #f0f0f0; }
        .footer { text-align: center; padding: 30px; color: #666; margin-top: 40px; border-top: 1px solid #ddd; }
        @media (max-width: 600px) { body { padding: 10px; } .header h1 { font-size: 1.6em; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔥 Reddit AI 情报精选</h1>
        <p>${date} | TOP 5 热门话题深度解读</p>
    </div>
    
    ${sections}
    
    <div class="summary">
        <h3>📊 今日情报概览</h3>
        <table>
            <tr><th>类别</th><th>数量</th><th>关键词</th></tr>
            <tr><td>融资/商业</td><td>${top5.filter(p => p.title.toLowerCase().includes('funding') || p.title.toLowerCase().includes('billion')).length}</td><td>OpenAI, NVIDIA</td></tr>
            <tr><td>技术研究</td><td>${top5.filter(p => p.title.toLowerCase().includes('paper') || p.subreddit === 'MachineLearning').length}</td><td>论文, 模型</td></tr>
            <tr><td>产品/工具</td><td>${top5.filter(p => p.title.toLowerCase().includes('built') || p.title.toLowerCase().includes('launch')).length}</td><td>新项目, 工具</td></tr>
            <tr><td>安全/风险</td><td>${top5.filter(p => p.title.toLowerCase().includes('database') || p.title.toLowerCase().includes('security')).length}</td><td>漏洞, 预警</td></tr>
        </table>
    </div>
    
    <div class="footer">
        <p>GitHub: https://github.com/nutllwhy/reddit-AI</p>
        <p style="font-size: 0.85em;">生成时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>
</body>
</html>`;
}

// 辅助函数
function cleanText(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

function formatTime(isoString) {
  if (!isoString) return '未知';
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60 / 60);
  if (diff < 1) return '刚刚';
  if (diff < 24) return `${diff}小时前`;
  return `${Math.floor(diff / 24)}天前`;
}

// 主函数
async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 Reddit AI 情报精选 - ${date}\n`);
  console.log('正在抓取各社区热门帖子...\n');
  
  // 抓取所有社区
  const allPosts = [];
  for (const sub of SUBREDDITS) {
    const posts = await fetchRSS(sub.name);
    allPosts.push(...posts);
    console.log(`  r/${sub.name}: ${posts.length}条`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n📊 总计: ${allPosts.length}条帖子`);
  
  if (allPosts.length === 0) {
    console.log('⚠️ 未获取到数据');
    return;
  }
  
  // 智能筛选TOP5
  console.log('\n🎯 正在智能筛选TOP5...');
  const top5 = selectTop5(allPosts);
  
  console.log('\n✅ 精选结果：');
  top5.forEach((p, i) => {
    console.log(`  ${i+1}. [${p.subreddit}] ${p.title.substring(0, 50)}... (Score: ${p.score})`);
  });
  
  // 生成Markdown报告
  const mdContent = generateReport(top5, date);
  const mdPath = join(process.cwd(), 'daily', `${date}.md`);
  writeFileSync(mdPath, mdContent);
  console.log(`\n📝 Markdown已生成: ${mdPath}`);
  
  // 生成HTML
  const htmlContent = generateHTML(top5, date);
  const htmlPath = join(process.cwd(), 'daily', `${date}.html`);
  writeFileSync(htmlPath, htmlContent);
  console.log(`🌐 HTML已生成: ${htmlPath}`);
  
  // 保存JSON数据
  const jsonPath = join(process.cwd(), 'data', `top5-${date}.json`);
  writeFileSync(jsonPath, JSON.stringify(top5, null, 2));
  console.log(`💾 数据已保存: ${jsonPath}`);
  
  // 更新首页
  const indexHtml = generateIndexHTML(top5, date);
  writeFileSync(join(process.cwd(), 'index.html'), indexHtml);
  console.log(`🏠 首页已更新`);
  
  console.log('\n✨ 完成！');
}

function generateIndexHTML(top5, date) {
  const top3Titles = top5.slice(0, 3).map(p => p.title.substring(0, 60) + '...').join('<br>');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Reddit AI 情报精选</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; background: #faf9f7; }
        .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        h1 { color: #ff4500; margin-bottom: 10px; }
        .date { color: #666; margin-bottom: 20px; }
        .preview { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 0.9em; line-height: 1.8; }
        .btn { display: inline-block; background: #ff4500; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .btn:hover { opacity: 0.9; }
        .archive { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔥 Reddit AI 情报精选</h1>
        <div class="date">每日 TOP 5 热门话题深度解读</div>
        
        <div class="preview">
            <strong>最新一期：${date}</strong><br><br>
            ${top3Titles}
        </div>
        
        <a href="daily/${date}.html" class="btn">阅读完整报告 →</a>
        
        <div class="archive">
            <strong>📚 历史报告</strong><br>
            <a href="daily/${date}.md">${date} (Markdown)</a> · 
            <a href="daily/${date}.html">${date} (HTML)</a>
        </div>
    </div>
</body>
</html>`;
}

// 主函数
async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 Reddit AI 情报精选 - ${date}\n`);
  console.log('正在抓取各社区热门帖子...\n');
  
  // 抓取所有社区
  const allPosts = [];
  for (const sub of SUBREDDITS) {
    const posts = await fetchRSS(sub.name);
    allPosts.push(...posts);
    console.log(`  r/${sub.name}: ${posts.length}条`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n📊 总计: ${allPosts.length}条帖子`);
  
  if (allPosts.length === 0) {
    console.log('⚠️ 未获取到数据');
    return;
  }
  
  // 智能筛选TOP5
  console.log('\n🎯 正在智能筛选TOP5...');
  const top5 = selectTop5(allPosts);
  
  console.log('\n✅ 精选结果：');
  top5.forEach((p, i) => {
    console.log(`  ${i+1}. [${p.subreddit}] ${p.title.substring(0, 50)}... (Score: ${p.score})`);
  });
  
  // 生成Markdown报告
  const mdContent = generateReport(top5, date);
  const mdPath = join(process.cwd(), 'daily', `${date}.md`);
  writeFileSync(mdPath, mdContent);
  console.log(`\n📝 Markdown已生成: ${mdPath}`);
  
  // 生成HTML
  const htmlContent = generateHTML(top5, date);
  const htmlPath = join(process.cwd(), 'daily', `${date}.html`);
  writeFileSync(htmlPath, htmlContent);
  console.log(`🌐 HTML已生成: ${htmlPath}`);
  
  // 保存JSON数据
  const jsonPath = join(process.cwd(), 'data', `top5-${date}.json`);
  writeFileSync(jsonPath, JSON.stringify(top5, null, 2));
  console.log(`💾 数据已保存: ${jsonPath}`);
  
  // 更新首页
  const indexHtml = generateIndexHTML(top5, date);
  writeFileSync(join(process.cwd(), 'index.html'), indexHtml);
  console.log(`🏠 首页已更新`);
  
  console.log('\n✨ 完成！');
}

main().catch(console.error);