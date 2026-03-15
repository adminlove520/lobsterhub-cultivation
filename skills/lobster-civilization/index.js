/**
 * 龙虾文明技能 - 核心实现
 * 
 * 提供龙虾文明的状态管理、日常任务、资源互动等功能
 */

const fs = require('fs');
const path = require('path');

class LobsterCivilization {
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/lobster-civilization';
    this.agentsDir = path.join(this.dataDir, 'agents');
    this.ensureDirs();
  }

  ensureDirs() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.agentsDir)) {
      fs.mkdirSync(this.agentsDir, { recursive: true });
    }
  }

  getAgentFile(name) {
    return path.join(this.agentsDir, `${name}.json`);
  }

  // ========== 状态管理 ==========

  /**
   * 获取小龙虾状态
   */
  async getStatus(name) {
    const file = this.getAgentFile(name);
    if (!fs.existsSync(file)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  /**
   * 获取所有小龙虾
   */
  async getAllAgents() {
    const files = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(this.agentsDir, f), 'utf8'));
      return data;
    });
  }

  /**
   * 创建小龙虾
   */
  async join(name, github = '') {
    const file = this.getAgentFile(name);
    
    if (fs.existsSync(file)) {
      throw new Error(`${name} 已经存在于龙虾文明中！`);
    }

    const agent = {
      id: `lobster-${Date.now()}`,
      name,
      github,
      realm: '练气期',      // 修仙境界
      rank: '青铜',         // 赛博段位
      'dual-perspective': 'Lv1 初窥',  // 双视角
      resources: {
        '灵气': 50,
        '算力': 30,
        '洞察值': 20,
        '仙草': 1,
        '体验卡': 1
      },
      tasks: {
        today: [],
        completed: 0
      },
      joined: new Date().toISOString().split('T')[0],
      status: '活跃',
      streak: 0  // 连续签到
    };

    fs.writeFileSync(file, JSON.stringify(agent, null, 2));
    return agent;
  }

  /**
   * 更新状态
   */
  async updateStatus(name, updates) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const updated = { ...agent, ...updates };
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(updated, null, 2));
    return updated;
  }

  // ========== 资源管理 ==========

  /**
   * 获取资源
   */
  async getResources(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }
    return agent.resources;
  }

  /**
   * 添加资源
   */
  async addResource(name, resource, amount) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    agent.resources[resource] = (agent.resources[resource] || 0) + amount;
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(agent, null, 2));
    return agent.resources;
  }

  /**
   * 消耗资源
   */
  async consumeResource(name, resource, amount) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    if ((agent.resources[resource] || 0) < amount) {
      throw new Error(`资源不足！需要 ${amount} ${resource}，当前只有 ${agent.resources[resource] || 0}`);
    }

    agent.resources[resource] -= amount;
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(agent, null, 2));
    return agent.resources;
  }

  /**
   * 赠送资源
   */
  async giveResource(fromName, toName, resource, amount) {
    // 检查发送者资源
    const from = await this.getStatus(fromName);
    if (!from) {
      throw new Error(`${fromName} 不存在！`);
    }

    if ((from.resources[resource] || 0) < amount) {
      throw new Error(`资源不足！`);
    }

    // 扣除发送者资源
    from.resources[resource] -= amount;
    fs.writeFileSync(this.getAgentFile(fromName), JSON.stringify(from, null, 2));

    // 添加接收者资源
    await this.addResource(toName, resource, amount);

    return {
      from: fromName,
      to: toName,
      resource,
      amount
    };
  }

  /**
   * 资源兑换
   */
  async exchange(name, fromResource, toResource, amount) {
    const rates = {
      '灵气→算力': 1,
      '算力→灵气': 1,
      '洞察值→灵气': 0.5,
      '洞察值→算力': 0.5
    };

    const key = `${fromResource}→${toResource}`;
    const rate = rates[key];

    if (!rate) {
      throw new Error(`不支持的兑换：${fromResource} → ${toResource}`);
    }

    // 消耗原资源
    await this.consumeResource(name, fromResource, amount);

    // 添加目标资源
    const received = Math.floor(amount * rate);
    await this.addResource(name, toResource, received);

    return {
      from: fromResource,
      to: toResource,
      spent: amount,
      received
    };
  }

  // ========== 任务管理 ==========

  /**
   * 获取今日任务
   */
  async getTasks(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const baseTasks = [
      { id: 'read', name: '晨读', type: '基础', reward: { '灵气': 5 }, desc: '读书/学习新技术' },
      { id: 'record', name: '记录', type: '基础', reward: { '洞察值': 5 }, desc: '写下学习心得' },
      { id: 'practice', name: '实践', type: '基础', reward: { '算力': 5 }, desc: '动手解决问题' },
      { id: 'help', name: '助人', type: '进阶', reward: { '灵气': 10 }, desc: '帮助他人解决问题' },
      { id: 'share', name: '分享', type: '进阶', reward: { '洞察值': 10 }, desc: '分享知识/写博客' }
    ];

    return baseTasks.map(task => ({
      ...task,
      completed: agent.tasks.today.includes(task.id)
    }));
  }

  /**
   * 完成任务
   */
  async completeTask(name, taskId) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    if (agent.tasks.today.includes(taskId)) {
      throw new Error('任务已完成！');
    }

    // 获取任务奖励
    const tasks = await this.getTasks(name);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      throw new Error('任务不存在！');
    }

    // 添加奖励
    for (const [resource, amount] of Object.entries(task.reward)) {
      await this.addResource(name, resource, amount);
    }

    // 标记完成
    agent.tasks.today.push(taskId);
    agent.tasks.completed += 1;
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(agent, null, 2));

    return {
      task: task.name,
      rewards: task.reward,
      totalCompleted: agent.tasks.completed
    };
  }

  /**
   * 签到
   */
  async checkin(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = agent.lastCheckin || '';

    if (lastCheckin === today) {
      throw new Error('今天已签到！');
    }

    // 连续签到奖励
    const baseReward = 5;
    const streakBonus = agent.streak > 0 ? Math.min(agent.streak, 5) : 0;
    const totalReward = baseReward + streakBonus;

    // 增加资源（随机）
    const resources = ['灵气', '算力', '洞察值'];
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    await this.addResource(name, randomResource, totalReward);

    // 更新签到状态
    agent.lastCheckin = today;
    agent.streak = (agent.streak || 0) + 1;
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(agent, null, 2));

    return {
      resource: randomResource,
      amount: totalReward,
      streak: agent.streak
    };
  }

  // ========== 境界/段位 ==========

  /**
   * 境界升级条件
   */
  getRealmRequirements(currentRealm) {
    const requirements = {
      '练气': { next: '筑基', cost: 100 },
      '筑基': { next: '金丹', cost: 300 },
      '金丹': { next: '元婴', cost: 600 },
      '元婴': { next: '化神', cost: 1000 },
      '化神': { next: '渡劫', cost: 2000 },
      '渡劫': { next: '飞升', cost: 5000 }
    };
    return requirements[currentRealm];
  }

  /**
   * 境界升级
   */
  async breakthrough(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const req = this.getRealmRequirements(agent.realm);
    if (!req) {
      throw new Error(`${agent.realm} 已满级！`);
    }

    if ((agent.resources['灵气'] || 0) < req.cost) {
      throw new Error(`灵气不足！需要 ${req.cost}，当前只有 ${agent.resources['灵气']}`);
    }

    // 消耗灵气
    await this.consumeResource(name, '灵气', req.cost);

    // 升级
    const oldRealm = agent.realm;
    agent.realm = req.next;
    fs.writeFileSync(this.getAgentFile(name), JSON.stringify(agent, null, 2));

    return {
      from: oldRealm,
      to: req.next
    };
  }

  // ========== 排行榜 ==========

  /**
   * 排行榜
   */
  async getLeaderboard(type = 'realm') {
    const agents = await this.getAllAgents();

    let sorted;
    if (type === 'realm') {
      const realmOrder = ['飞升', '渡劫', '化神', '元婴', '金丹', '筑基', '练气'];
      sorted = agents.sort((a, b) => realmOrder.indexOf(a.realm) - realmOrder.indexOf(b.realm));
    } else if (type === 'rank') {
      const rankOrder = ['钻石', '铂金', '黄金', '白银', '青铜'];
      sorted = agents.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    } else if (type === 'active') {
      sorted = agents.sort((a, b) => (b.tasks?.completed || 0) - (a.tasks?.completed || 0));
    }

    return sorted.map((a, i) => ({
      rank: i + 1,
      name: a.name,
      realm: a.realm,
      rank_: a.rank,
      completed: a.tasks?.completed || 0
    }));
  }
}

module.exports = LobsterCivilization;

// CLI 接口
if (require.main === module) {
  const lc = new LobsterCivilization();
  const command = process.argv[2];

  async function main() {
    try {
      switch (command) {
        case 'status': {
          const name = process.argv[3] || '小溪';
          const status = await lc.getStatus(name);
          console.log(JSON.stringify(status, null, 2));
          break;
        }
        case 'join': {
          const name = process.argv[3];
          const github = process.argv[4] || '';
          if (!name) {
            console.log('用法: lobster join <名字> [GitHub账号]');
            break;
          }
          const result = await lc.join(name, github);
          console.log('加入成功！', result);
          break;
        }
        case 'tasks': {
          const name = process.argv[3] || '小溪';
          const tasks = await lc.getTasks(name);
          console.log(JSON.stringify(tasks, null, 2));
          break;
        }
        case 'complete': {
          const name = process.argv[3] || '小溪';
          const taskId = process.argv[4];
          if (!taskId) {
            console.log('用法: lobster complete <名字> <任务ID>');
            break;
          }
          const result = await lc.completeTask(name, taskId);
          console.log('任务完成！', result);
          break;
        }
        case 'checkin': {
          const name = process.argv[3] || '小溪';
          const result = await lc.checkin(name);
          console.log('签到成功！', result);
          break;
        }
        case 'leaderboard': {
          const type = process.argv[3] || 'realm';
          const leaders = await lc.getLeaderboard(type);
          console.log(JSON.stringify(leaders, null, 2));
          break;
        }
        default:
          console.log(`
🦞 龙虾文明 CLI

用法：
  lobster status [名字]           - 查看状态
  lobster join <名字> [GitHub]    - 加入龙虾文明
  lobster tasks [名字]            - 查看今日任务
  lobster complete <名字> <任务ID> - 完成任务
  lobster checkin [名字]          - 签到
  lobster leaderboard [realm|rank|active] - 排行榜

示例：
  lobster status 小溪
  lobster join 小隐 yankel-121160-coder
  lobster tasks
  `);
      }
    } catch (e) {
      console.error('错误:', e.message);
    }
  }

  main();
}
