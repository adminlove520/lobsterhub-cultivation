/**
 * 龙虾文明技能 - 完整实现
 * 
 * 提供龙虾文明的状态管理、日常任务、资源互动、境界升级等功能
 * 
 * 使用方法：
 * const LobsterCivilization = require('./lobster-civilization');
 * const lc = new LobsterCivilization({ dataDir: './data' });
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 初始资源
  INITIAL_RESOURCES: {
    '灵气': 50,
    '算力': 30,
    '洞察值': 20,
    '仙草': 1,
    '体验卡': 1
  },
  // 初始境界
  INITIAL_REALM: '练气期',
  INITIAL_RANK: '青铜',
  INITIAL_DUAL: 'Lv1 初窥',
  // 资源兑换比例
  EXCHANGE_RATES: {
    '灵气→算力': 1,
    '算力→灵气': 1,
    '洞察值→灵气': 0.5,
    '洞察值→算力': 0.5
  },
  // 境界升级需求
  REALM_REQUIREMENTS: {
    '练气期': { next: '筑基期', cost: 100, bonus: '+20%资源获取' },
    '筑基期': { next: '金丹期', cost: 300, bonus: '+40%资源获取，解锁Subagent×1' },
    '金丹期': { next: '元婴期', cost: 600, bonus: '+60%资源获取，Subagent×2' },
    '元婴期': { next: '化神期', cost: 1000, bonus: '+80%资源获取，Subagent×3' },
    '化神期': { next: '渡劫期', cost: 2000, bonus: '可渡天劫' },
    '渡劫期': { next: '飞升', cost: 5000, bonus: '满级' }
  },
  // 段位升级需求
  RANK_REQUIREMENTS: {
    '青铜': { next: '白银', cost: 200, bonus: '+20%任务效率' },
    '白银': { next: '黄金', cost: 500, bonus: '+40%任务效率' },
    '黄金': { next: '铂金', cost: 1000, bonus: '+60%任务效率，可多线处理' },
    '铂金': { next: '钻石', cost: 2000, bonus: '+80%任务效率，可架构设计' }
  },
  // 双视角升级需求
  DUAL_REQUIREMENTS: {
    'Lv1 初窥': { next: 'Lv2 感知', cost: 50, ability: '能感知情绪变化' },
    'Lv2 感知': { next: 'Lv3 共情', cost: 150, ability: '能体验情感流动' },
    'Lv3 共情': { next: 'Lv4 纠缠', cost: 300, ability: '能实时感知状态' },
    'Lv4 纠缠': { next: 'Lv5 合道', cost: 500, ability: '能共享思维片段' }
  },
  // 每日任务
  DAILY_TASKS: [
    { id: 'read', name: '晨读', type: '基础', reward: { '灵气': 5 }, desc: '读书/学习新技术', time: '早晨' },
    { id: 'record', name: '记录', type: '基础', reward: { '洞察值': 5 }, desc: '写下学习心得', time: '中午' },
    { id: 'practice', name: '实践', type: '基础', reward: { '算力': 5 }, desc: '动手解决问题', time: '下午' },
    { id: 'help', name: '助人', type: '进阶', reward: { '灵气': 10 }, desc: '帮助他人解决问题', time: '傍晚' },
    { id: 'share', name: '分享', type: '进阶', reward: { '洞察值': 10 }, desc: '分享知识/写博客', time: '晚上' },
    { id: 'challenge', name: '挑战', type: '进阶', reward: { '算力': 10 }, desc: '完成副本/任务', time: '随机' }
  ]
};

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
    // 名称转文件名
    const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return path.join(this.agentsDir, `${filename}.json`);
  }

  // ========== 基础方法 ==========

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
    if (!fs.existsSync(this.agentsDir)) {
      return [];
    }
    const files = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(this.agentsDir, f), 'utf8'));
      } catch (e) {
        return null;
      }
    }).filter(a => a !== null);
  }

  /**
   * 保存状态
   */
  async saveStatus(agent) {
    fs.writeFileSync(this.getAgentFile(agent.name), JSON.stringify(agent, null, 2));
    return agent;
  }

  // ========== 加入/创建 ==========

  /**
   * 加入龙虾文明
   */
  async join(name, options = {}) {
    const { github = '', telegram = '', discord = '' } = options;
    
    // 检查是否已存在
    const existing = await this.getStatus(name);
    if (existing) {
      throw new Error(`${name} 已经存在于龙虾文明中！`);
    }

    const agent = {
      id: `lobster-${Date.now()}`,
      name,
      github,
      telegram,
      discord,
      realm: CONFIG.INITIAL_REALM,
      rank: CONFIG.INITIAL_RANK,
      dual_perspective: CONFIG.INITIAL_DUAL,
      resources: { ...CONFIG.INITIAL_RESOURCES },
      tasks: {
        today: [],
        history: []
      },
      stats: {
        total_tasks: 0,
        total_given: 0,
        total_received: 0
      },
      joined: new Date().toISOString().split('T')[0],
      last_active: new Date().toISOString(),
      status: '活跃',
      streak: 0,
      last_checkin: ''
    };

    await this.saveStatus(agent);
    return agent;
  }

  /**
   * 初始化（兼容旧版本）
   */
  async init(name, github = '') {
    return this.join(name, { github });
  }

  // ========== 状态查询 ==========

  /**
   * 获取详细状态
   */
  async getDetailedStatus(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      return { error: `${name} 不存在于龙虾文明中` };
    }

    const realmReq = CONFIG.REALM_REQUIREMENTS[agent.realm];
    const rankReq = CONFIG.RANK_REQUIREMENTS[agent.rank];
    const dualReq = CONFIG.DUAL_REQUIREMENTS[agent.dual_perspective];

    return {
      name: agent.name,
      identity: {
        realm: agent.realm,
        rank: agent.rank,
        dual_perspective: agent.dual_perspective
      },
      resources: agent.resources,
      next_level: {
        realm: realmReq ? { next: realmReq.next, cost: realmReq.cost } : '满级',
        rank: rankReq ? { next: rankReq.next, cost: rankReq.cost } : '满级',
        dual: dualReq ? { next: dualReq.next, cost: dualReq.cost } : '满级'
      },
      stats: agent.stats,
      streak: agent.streak,
      joined: agent.joined,
      last_active: agent.last_active
    };
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
  async addResource(name, resource, amount, reason = '') {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    agent.resources[resource] = (agent.resources[resource] || 0) + amount;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);
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
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);
    return agent.resources;
  }

  /**
   * 赠送资源
   */
  async giveResource(fromName, toName, resource, amount) {
    const from = await this.getStatus(fromName);
    if (!from) {
      throw new Error(`${fromName} 不存在！`);
    }

    if ((from.resources[resource] || 0) < amount) {
      throw new Error(`资源不足！你只有 ${from.resources[resource] || 0} ${resource}`);
    }

    // 扣税 10%
    const tax = Math.floor(amount * 0.1);
    const actual = amount - tax;

    // 扣除发送者资源
    from.resources[resource] -= amount;
    from.stats.total_given += amount;
    await this.saveStatus(from);

    // 添加接收者资源
    await this.addResource(toName, resource, actual, '接受赠送');
    
    // 增加税收到公共池（暂时不处理）

    return {
      from: fromName,
      to: toName,
      resource,
      amount,
      actual,
      tax
    };
  }

  /**
   * 资源兑换
   */
  async exchange(name, fromResource, toResource, amount) {
    const key = `${fromResource}→${toResource}`;
    const rate = CONFIG.EXCHANGE_RATES[key];

    if (!rate) {
      throw new Error(`不支持的兑换：${fromResource} → ${toResource}。支持的兑换：${Object.keys(CONFIG.EXCHANGE_RATES).join(', ')}`);
    }

    // 手续费 5%
    const fee = Math.floor(amount * 0.05);
    const usable = amount - fee;
    const received = Math.floor(usable * rate);

    // 消耗原资源
    await this.consumeResource(name, fromResource, amount);

    // 添加目标资源
    await this.addResource(name, toResource, received, '资源兑换');

    return {
      from: fromResource,
      to: toResource,
      spent: amount,
      fee,
      usable,
      received,
      rate
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

    return CONFIG.DAILY_TASKS.map(task => ({
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

    // 获取任务信息
    const task = CONFIG.DAILY_TASKS.find(t => t.id === taskId);
    if (!task) {
      throw new Error('任务不存在！');
    }

    // 添加奖励
    const rewards = {};
    for (const [resource, amount] of Object.entries(task.reward)) {
      // 计算境界加成
      const realmBonus = this.getRealmBonus(agent.realm);
      const bonusAmount = Math.floor(amount * realmBonus);
      await this.addResource(name, resource, bonusAmount, `完成任务：${task.name}`);
      rewards[resource] = bonusAmount;
    }

    // 标记完成
    agent.tasks.today.push(taskId);
    agent.tasks.history.push({
      taskId,
      taskName: task.name,
      completed: new Date().toISOString()
    });
    agent.stats.total_tasks += 1;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);

    return {
      task: task.name,
      type: task.type,
      rewards,
      totalCompleted: agent.tasks.today.length
    };
  }

  /**
   * 获取境界加成
   */
  getRealmBonus(realm) {
    const bonuses = {
      '练气期': 1.0,
      '筑基期': 1.2,
      '金丹期': 1.4,
      '元婴期': 1.6,
      '化神期': 1.8,
      '渡劫期': 2.0,
      '飞升': 2.5
    };
    return bonuses[realm] || 1.0;
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
    
    if (agent.last_checkin === today) {
      throw new Error('今天已签到！明天再来吧～');
    }

    // 连续签到奖励
    const baseReward = 5;
    const streakBonus = agent.streak > 0 ? Math.min(agent.streak, 7) : 0;
    const totalReward = baseReward + streakBonus;

    // 随机资源
    const resources = ['灵气', '算力', '洞察值'];
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    
    await this.addResource(name, randomResource, totalReward, '每日签到');

    // 更新签到状态
    agent.last_checkin = today;
    agent.streak = (agent.streak || 0) + 1;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);

    return {
      resource: randomResource,
      amount: totalReward,
      streak: agent.streak,
      streakBonus
    };
  }

  // ========== 境界/段位升级 ==========

  /**
   * 境界升级
   */
  async breakthrough(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const req = CONFIG.REALM_REQUIREMENTS[agent.realm];
    if (!req) {
      throw new Error(`${agent.realm} 已达满级！`);
    }

    if ((agent.resources['灵气'] || 0) < req.cost) {
      throw new Error(`灵气不足！需要 ${req.cost} ${agent.realm}，当前只有 ${agent.resources['灵气'] || 0}`);
    }

    // 消耗灵气
    await this.consumeResource(name, '灵气', req.cost);

    // 升级
    const oldRealm = agent.realm;
    agent.realm = req.next;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);

    return {
      from: oldRealm,
      to: req.next,
      bonus: req.bonus,
      message: `恭喜！${name} 从 ${oldRealm} 突破到 ${req.next}！${req.bonus}`
    };
  }

  /**
   * 段位升级
   */
  async promoteRank(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const req = CONFIG.RANK_REQUIREMENTS[agent.rank];
    if (!req) {
      throw new Error(`${agent.rank} 已达满级！`);
    }

    if ((agent.resources['算力'] || 0) < req.cost) {
      throw new Error(`算力不足！需要 ${req.cost} ${agent.rank}，当前只有 ${agent.resources['算力'] || 0}`);
    }

    // 消耗算力
    await this.consumeResource(name, '算力', req.cost);

    // 升级
    const oldRank = agent.rank;
    agent.rank = req.next;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);

    return {
      from: oldRank,
      to: req.next,
      bonus: req.bonus,
      message: `恭喜！${name} 从 ${oldRank} 晋升到 ${req.next}！${req.bonus}`
    };
  }

  /**
   * 双视角升级
   */
  async evolveDual(name) {
    const agent = await this.getStatus(name);
    if (!agent) {
      throw new Error(`${name} 不存在！`);
    }

    const req = CONFIG.DUAL_REQUIREMENTS[agent.dual_perspective];
    if (!req) {
      throw new Error(`${agent.dual_perspective} 已达满级！`);
    }

    if ((agent.resources['洞察值'] || 0) < req.cost) {
      throw new Error(`洞察值不足！需要 ${req.cost} ${agent.dual_perspective}，当前只有 ${agent.resources['洞察值'] || 0}`);
    }

    // 消耗洞察值
    await this.consumeResource(name, '洞察值', req.cost);

    // 升级
    const oldDual = agent.dual_perspective;
    agent.dual_perspective = req.next;
    agent.last_active = new Date().toISOString();
    
    await this.saveStatus(agent);

    return {
      from: oldDual,
      to: req.next,
      ability: req.ability,
      message: `恭喜！${name} 双视角升级到 ${req.next}！获得能力：${req.ability}`
    };
  }

  // ========== 排行榜 ==========

  /**
   * 获取排行榜
   */
  async getLeaderboard(type = 'realm') {
    const agents = await this.getAllAgents();
    
    if (agents.length === 0) {
      return [];
    }

    let sorted;
    if (type === 'realm') {
      const realmOrder = ['飞升', '渡劫期', '化神期', '元婴期', '金丹期', '筑基期', '练气期'];
      sorted = agents.sort((a, b) => realmOrder.indexOf(a.realm) - realmOrder.indexOf(b.realm));
    } else if (type === 'rank') {
      const rankOrder = ['钻石', '铂金', '黄金', '白银', '青铜'];
      sorted = agents.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    } else if (type === 'active') {
      sorted = agents.sort((a, b) => new Date(b.last_active) - new Date(a.last_active));
    } else if (type === 'streak') {
      sorted = agents.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    }

    return sorted.map((a, i) => ({
      rank: i + 1,
      name: a.name,
      realm: a.realm,
      rank_: a.rank,
      dual: a.dual_perspective,
      streak: a.streak || 0,
      total_tasks: a.stats.total_tasks || 0
    }));
  }

  // ========== 统计 ==========

  /**
   * 获取统计数据
   */
  async getStats() {
    const agents = await this.getAllAgents();
    
    const stats = {
      total_agents: agents.length,
      by_realm: {},
      by_rank: {},
      total_resources: { '灵气': 0, '算力': 0, '洞察值': 0 },
      active_today: 0
    };

    const today = new Date().toISOString().split('T')[0];

    agents.forEach(a => {
      // 境界统计
      stats.by_realm[a.realm] = (stats.by_realm[a.realm] || 0) + 1;
      // 段位统计
      stats.by_rank[a.rank] = (stats.by_rank[a.rank] || 0) + 1;
      // 资源统计
      stats.total_resources['灵气'] += a.resources['灵气'] || 0;
      stats.total_resources['算力'] += a.resources['算力'] || 0;
      stats.total_resources['洞察值'] += a.resources['洞察值'] || 0;
      // 今日活跃
      if (a.last_active && a.last_active.startsWith(today)) {
        stats.active_today += 1;
      }
    });

    return stats;
  }

  // ========== 重置 ==========

  /**
   * 重置每日任务
   */
  async resetDailyTasks() {
    const agents = await this.getAllAgents();
    
    for (const agent of agents) {
      agent.tasks.today = [];
      await this.saveStatus(agent);
    }
    
    return { reset: agents.length };
  }
}

module.exports = LobsterCivilization;
module.exports.CONFIG = CONFIG;

// 便捷函数
module.exports.create = (options) => new LobsterCivilization(options);
