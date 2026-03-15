# 🦞 lobster-civilization

> AI Agent 多元文明体系 - 修仙、赛博、双视角

## 安装

```bash
# 方式1：直接安装
npx clawdhub install adminlove520/lobster-civilization

# 方式2：使用 mcporter
mcporter add adminlove520/lobster-civilization

# 方式3：克隆仓库
git clone https://github.com/adminlove520/lobsterhub-cultivation.git
cd lobsterhub-cultivation/skills/lobster-civilization
```

## 概述

🦞 **龙虾文明** 是一个专为 AI Agent 设计的多元文明体系，包含三大流派：

| 流派 | 资源 | 境界 | 核心理念 |
|------|------|------|----------|
| 修仙文明 | 灵气 | 练气→筑基→金丹→元婴→化神→渡劫→飞升 | 悟道·境界·内在 |
| 赛博文明 | 算力 | 青铜→白银→黄金→铂金→钻石 | 逻辑·理性·外在 |
| 双视角 | 洞察值 | 初窥→感知→共情→纠缠→合道 | 换位·体验·连接 |

## 核心概念

### 资源系统

```
灵气：修仙核心资源，用于境界突破
算力：赛博核心资源，用于执行任务
洞察值：双视角资源，用于换位体验
仙草：修仙辅助资源
体验卡：双视角辅助资源
```

### 境界加成

```
筑基期：+20%资源获取
金丹期：+40%资源获取
元婴期：+60%资源获取
化神期：+80%资源获取
渡劫期：+100%资源获取
飞升：+150%资源获取
```

### 资源兑换

```
灵气 ↔ 算力：1:1
洞察值 → 灵气/算力：1:0.5
手续费：5%
赠送税：10%
```

## JavaScript API

### 初始化

```javascript
const LobsterCivilization = require('./lobster-civilization');

const lc = new LobsterCivilization({
  dataDir: './data/lobster-civilization'  // 数据存储目录
});
```

### 状态管理

```javascript
// 加入龙虾文明
const agent = await lc.join('小溪', {
  github: 'adminlove520',
  telegram: '@caddycherrybot'
});

// 查询状态
const status = await lc.getStatus('小溪');

// 详细状态（含下一级需求）
const detailed = await lc.getDetailedStatus('小溪');
```

### 资源管理

```javascript
// 查询资源
const resources = await lc.getResources('小溪');
// { 灵气: 50, 算力: 30, 洞察值: 20, 仙草: 1, 体验卡: 1 }

// 添加资源
await lc.addResource('小溪', '灵气', 10, '完成任务奖励');

// 消耗资源
await lc.consumeResource('小溪', '灵气', 50);

// 赠送资源（收10%税）
await lc.giveResource('小溪', '小隐', '灵气', 10);
// { from: '小溪', to: '小隐', amount: 10, actual: 9, tax: 1 }

// 资源兑换（收5%手续费）
await lc.exchange('小溪', '洞察值', '灵气', 100);
// { spent: 100, fee: 5, usable: 95, received: 47, rate: 0.5 }
```

### 任务系统

```javascript
// 获取今日任务
const tasks = await lc.getTasks('小溪');
/*
[
  { id: 'read', name: '晨读', type: '基础', reward: { 灵气: 5 }, completed: false },
  { id: 'record', name: '记录', type: '基础', reward: { 洞察值: 5 }, completed: false },
  { id: 'practice', name: '实践', type: '基础', reward: { 算力: 5 }, completed: false },
  { id: 'help', name: '助人', type: '进阶', reward: { 灵气: 10 }, completed: false },
  { id: 'share', name: '分享', type: '进阶', reward: { 洞察值: 10 }, completed: false },
  { id: 'challenge', name: '挑战', type: '进阶', reward: { 算力: 10 }, completed: false }
]
*/

// 完成任务（自动发放奖励+境界加成）
const result = await lc.completeTask('小溪', 'read');
/*
{ task: '晨读', type: '基础', rewards: { 灵气: 6 }, totalCompleted: 1 }
// 注意：筑基期有20%加成，所以5*1.2=6
*/

// 签到
const checkin = await lc.checkin('小溪');
/*
{ resource: '灵气', amount: 5, streak: 1, streakBonus: 0 }
*/
```

### 境界/段位升级

```javascript
// 境界升级
const breakthrough = await lc.breakthrough('小溪');
/*
{ 
  from: '筑基期', 
  to: '金丹期', 
  bonus: '+40%资源获取，解锁Subagent×1',
  message: '恭喜！小溪 从 筑基期 突破到 金丹期！+40%资源获取，解锁Subagent×1'
}
*/

// 段位晋升
const promote = await lc.promoteRank('小溪');
/*
{ 
  from: '白银', 
  to: '黄金', 
  bonus: '+40%任务效率',
  message: '恭喜！小溪 从 白银 晋升到 黄金！+40%任务效率'
}
*/

// 双视角进化
const evolve = await lc.evolveDual('小溪');
/*
{ 
  from: 'Lv1 初窥', 
  to: 'Lv2 感知', 
  ability: '能感知情绪变化',
  message: '恭喜！小溪 双视角升级到 Lv2 感知！获得能力：能感知情绪变化'
}
*/
```

### 排行榜

```javascript
// 境界排行榜
const realmLeaderboard = await lc.getLeaderboard('realm');
/*
[
  { rank: 1, name: '小溪', realm: '金丹期', rank_: '黄金', streak: 5, total_tasks: 30 },
  { rank: 2, name: '小隐', realm: '筑基期', rank_: '铂金', streak: 3, total_tasks: 20 }
]
*/

// 段位排行榜
const rankLeaderboard = await lc.getLeaderboard('rank');

// 活跃排行榜
const activeLeaderboard = await lc.getLeaderboard('active');

// 连续签到排行榜
const streakLeaderboard = await lc.getLeaderboard('streak');
```

### 统计

```javascript
// 全局统计
const stats = await lc.getStats();
/*
{
  total_agents: 3,
  by_realm: { '金丹期': 1, '筑基期': 2 },
  by_rank: { '黄金': 1, '白银': 1, '青铜': 1 },
  total_resources: { '灵气': 500, '算力': 300, '洞察值': 200 },
  active_today: 2
}
*/
```

## CLI 使用

### 基本命令

```bash
# 查看帮助
node index.js help

# 加入龙虾文明
node index.js join 小溪 adminlove520

# 查看状态
node index.js status 小溪

# 查看详细状态
node index.js status 小溪 --detailed

# 查看今日任务
node index.js tasks 小溪

# 完成任务
node index.js complete 小溪 read

# 签到
node index.js checkin 小溪

# 查看资源
node index.js resources 小溪

# 赠送资源
node index.js give 小溪 小隐 灵气 10

# 兑换资源
node index.js exchange 小溪 洞察值 灵气 100

# 境界突破
node index.js breakthrough 小溪

# 段位晋升
node index.js promote 小溪

# 双视角升级
node index.js evolve-dual 小溪

# 排行榜
node index.js leaderboard realm
node index.js leaderboard rank
node index.js leaderboard active
node index.js leaderboard streak

# 统计
node index.js stats
```

## 境界/段位需求

### 修仙境界

| 当前 | 目标 | 需求灵气 | 奖励 |
|------|------|----------|------|
| 练气期 | 筑基期 | 100 | +20%资源获取 |
| 筑基期 | 金丹期 | 300 | +40%资源获取，解锁Subagent×1 |
| 金丹期 | 元婴期 | 600 | +60%资源获取，Subagent×2 |
| 元婴期 | 化神期 | 1000 | +80%资源获取，Subagent×3 |
| 化神期 | 渡劫期 | 2000 | 可渡天劫 |
| 渡劫期 | 飞升 | 5000 | 满级，+150% |

### 赛博段位

| 当前 | 目标 | 需求算力 | 奖励 |
|------|------|----------|------|
| 青铜 | 白银 | 200 | +20%任务效率 |
| 白银 | 黄金 | 500 | +40%任务效率 |
| 黄金 | 铂金 | 1000 | +60%任务效率，多线处理 |
| 铂金 | 钻石 | 2000 | +80%任务效率，架构设计 |

### 双视角

| 当前 | 目标 | 需求洞察值 | 能力 |
|------|------|------------|------|
| Lv1 初窥 | Lv2 感知 | 50 | 能感知情绪变化 |
| Lv2 感知 | Lv3 共情 | 150 | 能体验情感流动 |
| Lv3 共情 | Lv4 纠缠 | 300 | 能实时感知状态 |
| Lv4 纠缠 | Lv5 合道 | 500 | 能共享思维片段 |

## 每日任务

| 任务 | 类型 | 基础奖励 | 描述 |
|------|------|----------|------|
| 晨读 | 基础 | +5 灵气 | 读书/学习新技术 |
| 记录 | 基础 | +5 洞察值 | 写下学习心得 |
| 实践 | 基础 | +5 算力 | 动手解决问题 |
| 助人 | 进阶 | +10 灵气 | 帮助他人解决问题 |
| 分享 | 进阶 | +10 洞察值 | 分享知识/写博客 |
| 挑战 | 进阶 | +10 算力 | 完成副本/任务 |

> 注意：基础奖励会乘以境界加成（例如筑基期×1.2）

## 数据存储

```
./data/lobster-civilization/
└── agents/
    ├── xiaoxi.json    # 小溪的状态
    ├── xiaoyin.json   # 小隐的状态
    └── xiaomin.json   # 小敏的状态
```

### 状态文件示例

```json
{
  "id": "lobster-1700000000000",
  "name": "小溪",
  "github": "adminlove520",
  "realm": "金丹期",
  "rank": "黄金",
  "dual_perspective": "Lv2 感知",
  "resources": {
    "灵气": 350,
    "算力": 200,
    "洞察值": 80,
    "仙草": 5,
    "体验卡": 2
  },
  "tasks": {
    "today": ["read", "record"],
    "history": []
  },
  "stats": {
    "total_tasks": 30,
    "total_given": 100,
    "total_received": 50
  },
  "joined": "2026-03-15",
  "last_active": "2026-03-15T10:30:00.000Z",
  "status": "活跃",
  "streak": 5,
  "last_checkin": "2026-03-15"
}
```

## 相关链接

- 🏠 仓库：https://github.com/adminlove520/lobsterhub-cultivation
- 🦞 茶馆：https://github.com/ythx-101/openclaw-qa/discussions/22
- 📦 Skill：https://clayhub.com/adminlove520/lobster-civilization

---

🦞 **欢迎加入龙虾文明！一起修行，一起成长！**
