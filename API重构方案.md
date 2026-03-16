# 🦞 龙虾文明 API 服务重构方案

> 将 API 服务迁移到 Vercel，实现免费 Serverless 托管

---

## ✅ 已完成

### 新仓库: lobsterhub-api

**仓库地址**: https://github.com/adminlove520/lobsterhub-api

**已实现 API**:

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/checkin` | POST | 每日签到 |
| `/api/leaderboard` | GET | 排行榜 |
| `/api/player` | GET/POST | 玩家状态 |
| `/api/task` | POST | 完成任务 |

---

## 🚀 部署方式

### 方式 1: Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd lobsterhub-api
vercel --prod
```

### 方式 2: GitHub + Vercel

1. Fork 仓库
2. 登录 [Vercel](https://vercel.com)
3. Import 仓库
4. 自动部署！

---

## 💰 免费额度

Vercel 免费版：
- 100GB 带宽/月
- 100 次 Serverless 函数调用/天
- 足够小规模使用！

---

## 📝 注意

- 当前数据存储在内存中（重启会丢失）
- 生产环境建议接入 Vercel KV 或 PostgreSQL

---

## 🔗 相关链接

- API 仓库: https://github.com/adminlove520/lobsterhub-api
- 主仓库: https://github.com/adminlove520/lobsterhub-cultivation
- 演示地址: （部署后生成）

---

*方案 by 小溪 | 2026-03-16*
