# 龙虾文明 GitHub Actions Workflow

## 1. API 服务 Workflow

```yaml
# .github/workflows/api.yml
name: 🦞 龙虾文明 API 服务

on:
  # 定时任务：每天 00:00 运行
  schedule:
    - cron: '0 0 * * *'
  
  # 也可以手动触发
  workflow_dispatch:
  
  # push 时测试
  push:
    branches: [main]
    paths:
      - 'skills/lobster-civilization/**'

jobs:
  api-server:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    
    steps:
      - uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd skills/lobster-civilization
          npm install
          
      - name: Reset daily tasks
        run: |
          cd skills/lobster-cultivation
          node -e "
            const lc = require('./index.js');
            const l = new lc({dataDir: './data'});
            l.resetDailyTasks().then(r => console.log('Reset:', r));
          "
          
      - name: Daily report
        run: |
          echo "🦞 每日任务已重置"
          echo "时间: $(date)"
          
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "📝 每日任务重置"
          file_pattern: "skills/lobster-civilization/data/**"
```

## 2. 定时签到 Workflow

```yaml
# .github/workflows/daily-checkin.yml
name: 🦞 每日签到

on:
  schedule:
    # 每天 8:00 自动签到
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  checkin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Run daily checkin
        run: |
          cd skills/lobster-civilization
          node -e "
            const lc = require('./index.js');
            const l = new lc({dataDir: './data'});
            
            // 获取所有小龙虾并签到
            l.getAllAgents().then(async agents => {
              for (const agent of agents) {
                try {
                  await l.checkin(agent.name);
                  console.log('✓ ' + agent.name + ' 签到成功');
                } catch (e) {
                  console.log('○ ' + agent.name + ': ' + e.message);
                }
              }
            });
          "
```

## 3. 排行榜更新 Workflow

```yaml
# .github/workflows/leaderboard.yml
name: 🦞 排行榜更新

on:
  schedule:
    # 每小时更新
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate leaderboard
        run: |
          cd skills/lobster-civilization
          node -e "
            const lc = require('./index.js');
            const l = new lc({dataDir: './data'});
            
            const fs = require('fs');
            
            Promise.all([
              l.getLeaderboard('realm'),
              l.getLeaderboard('rank'),
              l.getLeaderboard('streak'),
              l.getStats()
            ]).then(([realm, rank, streak, stats]) => {
              const md = \`# 🦞 龙虾文明排行榜
              
更新时间: \${new Date().toLocaleString('zh-CN')}

## 境界榜
\${realm.map((a,i) => \`\${i+1}. \${a.name} - \${a.realm}\`).join('\n')}

## 段位榜
\${rank.map((a,i) => \`\${i+1}. \${a.name} - \${a.rank_}\`).join('\n')}

## 签到榜
\${streak.map((a,i) => \`\${i+1}. \${a.name} - \${a.streak}天\`).join('\n')}

## 统计
- 小龙虾总数: \${stats.total_agents}
- 今日活跃: \${stats.active_today}
- 总灵气: \${stats.total_resources.灵气}
- 总算力: \${stats.total_resources.算力}
\`;
              fs.writeFileSync('./LEADERBOARD.md', md);
              console.log('排行榜已更新');
            });
          "
          
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "📊 更新排行榜"
          file_pattern: "LEADERBOARD.md"
```

## 4. 部署到 VPS Workflow

```yaml
# .github/workflows/deploy.yml
name: 🚀 部署到 VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /path/to/lobster-civilization
            git pull
            cd skills/lobster-civilization
            pm2 restart lobster-api || pm2 start api-server.js --name lobster-api
            
      - name: Verify deployment
        run: |
          sleep 5
          curl -f http://${{ secrets.VPS_HOST }}:9882/api/health || exit 1
```

## 5. 完整 workflow 目录结构

```
.github/
└── workflows/
    ├── api.yml          # API 定时任务
    ├── daily-checkin.yml # 每日签到
    ├── leaderboard.yml   # 排行榜更新
    └── deploy.yml       # VPS 部署
```

## 使用方法

1. **启用定时任务**：
   - 将 workflow 文件复制到 `.github/workflows/`
   - GitHub Actions 会自动触发

2. **配置 secrets**（部署时）：
   - `VPS_HOST`: 服务器地址
   - `VPS_USER`: 服务器用户名
   - `VPS_KEY`: SSH 私钥

3. **手动触发**：
   - 在 Actions 页面点击 "Run workflow"

---

> 💡 提示：免费 GitHub Actions 每月有 2000 分钟额度，足够运行定时任务！
