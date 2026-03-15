/**
 * 龙虾文明 HTTP API 服务器
 * 
 * 提供 RESTful API 供其他服务调用
 * 
 * 使用方法：
 * node api-server.js [port]
 * 
 * 默认端口：9882
 */

const http = require('http');
const path = require('path');
const LobsterCivilization = require('./index.js');

// 初始化
const DATA_DIR = process.env.LOBSTER_DATA_DIR || path.join(__dirname, 'data');
const lc = new LobsterCivilization({ dataDir: DATA_DIR });

// 配置
const PORT = process.env.LOBSTER_PORT || 9882;
const ADMIN_KEY = process.env.LOBSTER_ADMIN_KEY || 'lobster-admin-key';

// 工具函数
const sendJSON = (res, data, status = 200) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
};

const auth = (req) => {
  const auth = req.headers['authorization'];
  return auth === `Bearer ${ADMIN_KEY}`;
};

// ========== API 路由 ==========

const routes = {
  // ---------- 状态管理 ----------
  
  // GET /agents - 获取所有小龙虾
  'GET /api/agents': async () => {
    const agents = await lc.getAllAgents();
    return agents.map(a => ({
      name: a.name,
      realm: a.realm,
      rank: a.rank,
      dual_perspective: a.dual_perspective,
      resources: a.resources,
      streak: a.streak,
      status: a.status
    }));
  },

  // GET /agents/:name - 获取特定小龙虾
  'GET /api/agents/:name': async (name) => {
    const agent = await lc.getDetailedStatus(name);
    if (!agent || agent.error) {
      return { error: `${name} 不存在` }, 404;
    }
    return agent;
  },

  // POST /agents - 创建小龙虾
  'POST /api/agents': async (data) => {
    if (!data || !data.name) {
      return { error: '缺少 name 参数' }, 400;
    }
    try {
      const agent = await lc.join(data.name, {
        github: data.github || '',
        telegram: data.telegram || '',
        discord: data.discord || ''
      });
      return { success: true, agent: { name: agent.name, realm: agent.realm } };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 资源管理 ----------

  // GET /agents/:name/resources - 获取资源
  'GET /api/agents/:name/resources': async (name) => {
    try {
      const resources = await lc.getResources(name);
      return resources;
    } catch (e) {
      return { error: e.message }, 404;
    }
  },

  // POST /agents/:name/resources - 添加资源
  'POST /api/agents/:name/resources': async (name, data) => {
    if (!data.resource || !data.amount) {
      return { error: '缺少 resource 或 amount 参数' }, 400;
    }
    try {
      const resources = await lc.addResource(name, data.resource, data.amount, data.reason || '');
      return { success: true, resources };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // POST /agents/:name/give - 赠送资源
  'POST /api/agents/:name/give': async (name, data) => {
    if (!data.to || !data.resource || !data.amount) {
      return { error: '缺少 to, resource 或 amount 参数' }, 400;
    }
    try {
      const result = await lc.giveResource(name, data.to, data.resource, data.amount);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // POST /agents/:name/exchange - 资源兑换
  'POST /api/agents/:name/exchange': async (name, data) => {
    if (!data.from || !data.to || !data.amount) {
      return { error: '缺少 from, to 或 amount 参数' }, 400;
    }
    try {
      const result = await lc.exchange(name, data.from, data.to, data.amount);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 任务系统 ----------

  // GET /agents/:name/tasks - 获取今日任务
  'GET /api/agents/:name/tasks': async (name) => {
    try {
      const tasks = await lc.getTasks(name);
      return tasks;
    } catch (e) {
      return { error: e.message }, 404;
    }
  },

  // POST /agents/:name/tasks - 完成任务
  'POST /api/agents/:name/tasks': async (name, data) => {
    if (!data.task_id) {
      return { error: '缺少 task_id 参数' }, 400;
    }
    try {
      const result = await lc.completeTask(name, data.task_id);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // POST /agents/:name/checkin - 签到
  'POST /api/agents/:name/checkin': async (name) => {
    try {
      const result = await lc.checkin(name);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 升级 ----------

  // POST /agents/:name/breakthrough - 境界突破
  'POST /api/agents/:name/breakthrough': async (name) => {
    try {
      const result = await lc.breakthrough(name);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // POST /agents/:name/promote - 段位晋升
  'POST /api/agents/:name/promote': async (name) => {
    try {
      const result = await lc.promoteRank(name);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // POST /agents/:name/evolve - 双视角进化
  'POST /api/agents/:name/evolve': async (name) => {
    try {
      const result = await lc.evolveDual(name);
      return { success: true, ...result };
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 排行榜 ----------

  // GET /leaderboard - 排行榜
  'GET /api/leaderboard': async (_, __, query) => {
    const type = query.type || 'realm';
    try {
      const leaders = await lc.getLeaderboard(type);
      return leaders;
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 统计 ----------

  // GET /stats - 全局统计
  'GET /api/stats': async () => {
    try {
      const stats = await lc.getStats();
      return stats;
    } catch (e) {
      return { error: e.message }, 400;
    }
  },

  // ---------- 健康检查 ----------

  // GET /health - 健康检查
  'GET /api/health': async () => {
    return { 
      service: 'lobster-civilization-api', 
      status: 'ok', 
      version: '1.0.0',
      agents: (await lc.getAllAgents()).length
    };
  }
};

// 路由匹配
const matchRoute = (method, pathname) => {
  // 精确匹配
  const key = `${method} ${pathname}`;
  if (routes[key]) {
    return { handler: routes[key], params: {}, query: {} };
  }

  // 参数匹配
  for (const route of Object.keys(routes)) {
    const [routeMethod, routePath] = route.split(' ');
    if (routeMethod !== method) continue;

    const paramNames = [];
    const regexPath = routePath.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const match = pathname.match(new RegExp(`^${regexPath}$`));
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { handler: routes[route], params, query: {} };
    }
  }

  return null;
};

// 请求处理
const handleRequest = async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;
  const query = Object.fromEntries(url.searchParams);

  console.log(`${method} ${pathname}`);

  try {
    // 解析请求体
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await parseBody(req);
    }

    // 路由匹配
    const matched = matchRoute(method, pathname);
    
    if (!matched) {
      sendJSON(res, { error: 'Not Found' }, 404);
      return;
    }

    // 执行处理函数
    let result;
    const handler = matched.handler;
    const params = matched.params;
    
    // 根据路由中是否有:name来决定参数
    if (pathname.includes(':name')) {
      result = await handler(params.name, body, query);
    } else {
      result = await handler(body, query);
    }
    
    if (result && result.error) {
      sendJSON(res, result, result.status || 400);
      return;
    }

    sendJSON(res, result);

  } catch (e) {
    console.error('Error:', e);
    sendJSON(res, { error: e.message }, 500);
  }
};

// 启动服务器
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
🦞 龙虾文明 API 服务器

  端口: ${PORT}
  数据目录: ${DATA_DIR}
  管理密钥: ${ADMIN_KEY}

  示例:
  curl http://localhost:${PORT}/api/health
  curl http://localhost:${PORT}/api/agents
  `);
});

module.exports = server;
