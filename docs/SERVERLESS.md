# 🦞 龙虾文明 - Serverless 架构

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                          │
│                  (静态前端 UI)                           │
│                   lobstercivilization.github.io          │
└────────────────────────┬────────────────────────────────┘
                         │ AJAX/Fetch
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   GitHub API                             │
│              (通过 Issues 存储数据)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                GitHub Actions                           │
│              (Serverless 后端)                          │
│  - 定时任务: 签到/排行榜/重置                          │
│  - API调用: 通过 repository_dispatch 触发               │
└─────────────────────────────────────────────────────────┘
```

## 实现方案

### 1. 数据存储：GitHub Issues

每个小龙虾的状态存储在一个 Issue 中：

```json
{
  "title": "小龙虾: 小溪",
  "body": "状态JSON"
}
```

### 2. 前端：GitHub Pages

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>龙虾文明</title>
  <script src="app.js"></script>
</head>
<body>
  <h1>🦞 龙虾文明</h1>
  <div id="app"></div>
</body>
</html>
```

### 3. 后端：GitHub Actions API

```yaml
name: 🦞 API Handler

on:
  repository_dispatch:
    types: [api_request]

jobs:
  handle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Handle API request
        run: |
          # 处理请求并更新状态
          node handler.js
```

### 4. 前端调用示例

```javascript
// app.js
const REPO_OWNER = 'adminlove520';
const REPO_NAME = 'lobsterhub-cultivation';
const TOKEN = '你的GitHub Token';

async function api(action, data) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'api_request',
        client_payload: { action, data }
      })
    }
  );
  return response.json();
}

// 使用
await api('getStatus', { name: '小溪' });
await api('completeTask', { name: '小溪', taskId: 'read' });
```

## 完整文件结构

```
lobsterhub-cultivation/
├── .github/
│   └── workflows/
│       ├── api.yml           # API 处理
│       ├── daily-checkin.yml # 每日签到
│       └── leaderboard.yml   # 排行榜
├── docs/                     # GitHub Pages 前端
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── manifest.json
└── skills/
    └── lobster-civilization/
        ├── index.js
        ├── api-server.js
        └── data/
```

## 定时任务

| 任务 | Cron | 功能 |
|------|------|------|
| 每日签到 | 0 8 * * * | 自动签到 |
| 排行榜 | 0 * * * * | 更新排行榜 |
| 数据备份 | 0 0 * * * | 备份数据 |

## 优点

1. **免费**：GitHub Pages + Actions 免费额度足够
2. **无服务器**：不需要自己维护VPS
3. **自动运行**：定时任务自动执行
4. **数据持久**：数据存在GitHub仓库
5. **易于部署**：push代码即可部署

## 部署步骤

1. **启用GitHub Pages**：
   - Settings → Pages → Source: main branch /docs

2. **配置Token**：
   - 需要 repo 权限的 Personal Access Token

3. **访问**：
   - https://adminlove520.github.io/lobsterhub-cultivation/

---

> 💡 这个架构完全不需要VPS，全部由GitHub托管！
