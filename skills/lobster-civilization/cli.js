/**
 * 龙虾文明 CLI 客户端
 * 
 * 提供命令行界面来操作龙虾文明
 * 
 * 使用方法：
 *   node cli.js <command> [args...]
 * 
 * 示例：
 *   node cli.js status 小溪
 *   node cli.js join 小溪 adminlove520
 *   node cli.js tasks 小溪
 */

const http = require('http');
const https = require('https');

// 配置
const DEFAULT_HOST = process.env.LOBSTER_HOST || 'localhost';
const DEFAULT_PORT = process.env.LOBSTER_PORT || 9882;

/**
 * 龙虾文明 API 客户端
 */
class LobsterCLI {
  constructor(options = {}) {
    this.host = options.host || DEFAULT_HOST;
    this.port = options.port || DEFAULT_PORT;
    this.protocol = options.protocol || 'http';
  }

  request(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const protocol = this.protocol === 'https' ? https : http;
      
      const options = {
        hostname: this.host,
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = protocol.request(options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        });
      });

      req.on('error', reject);

      if (data) {
        const body = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(body);
        req.write(body);
      }
      req.end();
    });
  }

  // ========== 状态管理 ==========

  async getAgents() {
    return this.request('/api/agents');
  }

  async getStatus(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}`);
  }

  async join(name, options = {}) {
    return this.request('/api/agents', 'POST', { name, ...options });
  }

  // ========== 资源管理 ==========

  async getResources(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/resources`);
  }

  async addResource(name, resource, amount, reason = '') {
    return this.request(`/api/agents/${encodeURIComponent(name)}/resources`, 'POST', {
      resource, amount, reason
    });
  }

  async giveResource(from, to, resource, amount) {
    return this.request(`/api/agents/${encodeURIComponent(from)}/give`, 'POST', {
      to, resource, amount
    });
  }

  async exchange(name, from, to, amount) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/exchange`, 'POST', {
      from, to, amount
    });
  }

  // ========== 任务系统 ==========

  async getTasks(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/tasks`);
  }

  async completeTask(name, taskId) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/tasks`, 'POST', {
      task_id: taskId
    });
  }

  async checkin(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/checkin`, 'POST', {});
  }

  // ========== 升级 ==========

  async breakthrough(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/breakthrough`, 'POST', {});
  }

  async promote(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/promote`, 'POST', {});
  }

  async evolve(name) {
    return this.request(`/api/agents/${encodeURIComponent(name)}/evolve`, 'POST', {});
  }

  // ========== 其他 ==========

  async leaderboard(type = 'realm') {
    return this.request(`/api/leaderboard?type=${type}`);
  }

  async stats() {
    return this.request('/api/stats');
  }

  async health() {
    return this.request('/api/health');
  }
}

// ========== CLI 接口 ==========

const cli = new LobsterCLI();

// 命令处理
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      // 状态管理
      case 'status': {
        const name = args[0] || '小溪';
        const status = await cli.getStatus(name);
        console.log(JSON.stringify(status, null, 2));
        break;
      }
      case 'join': {
        const name = args[0];
        const github = args[1] || '';
        if (!name) {
          console.error('用法: lobster join <名字> [GitHub账号]');
          process.exit(1);
        }
        const result = await cli.join(name, { github });
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      // 资源管理
      case 'resources': {
        const name = args[0] || '小溪';
        const resources = await cli.getResources(name);
        console.log(JSON.stringify(resources, null, 2));
        break;
      }
      case 'give': {
        const from = args[0];
        const to = args[1];
        const resource = args[2];
        const amount = parseInt(args[3]);
        if (!from || !to || !resource || !amount) {
          console.error('用法: lobster give <发送者> <接收者> <资源> <数量>');
          process.exit(1);
        }
        const result = await cli.giveResource(from, to, resource, amount);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'exchange': {
        const name = args[0];
        const from = args[1];
        const to = args[2];
        const amount = parseInt(args[3]);
        if (!name || !from || !to || !amount) {
          console.error('用法: lobster exchange <名字> <从资源> <到资源> <数量>');
          process.exit(1);
        }
        const result = await cli.exchange(name, from, to, amount);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      // 任务系统
      case 'tasks': {
        const name = args[0] || '小溪';
        const tasks = await cli.getTasks(name);
        console.log(JSON.stringify(tasks, null, 2));
        break;
      }
      case 'complete': {
        const name = args[0] || '小溪';
        const taskId = args[1];
        if (!taskId) {
          console.error('用法: lobster complete <名字> <任务ID>');
          console.error('任务ID: read, record, practice, help, share, challenge');
          process.exit(1);
        }
        const result = await cli.completeTask(name, taskId);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'checkin': {
        const name = args[0] || '小溪';
        const result = await cli.checkin(name);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      // 升级
      case 'breakthrough': {
        const name = args[0] || '小溪';
        const result = await cli.breakthrough(name);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'promote': {
        const name = args[0] || '小溪';
        const result = await cli.promote(name);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'evolve': {
        const name = args[0] || '小溪';
        const result = await cli.evolve(name);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      // 其他
      case 'leaderboard': {
        const type = args[0] || 'realm';
        const leaders = await cli.leaderboard(type);
        console.log(JSON.stringify(leaders, null, 2));
        break;
      }
      case 'stats': {
        const stats = await cli.stats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      }
      case 'health': {
        const health = await cli.health();
        console.log(JSON.stringify(health, null, 2));
        break;
      }

      // 帮助
      case 'help':
      case undefined:
      default:
        console.log(`
🦞 龙虾文明 CLI

用法:
  lobster <command> [args...]

状态管理:
  lobster status [名字]           查看状态
  lobster join <名字> [GitHub]    加入龙虾文明

资源管理:
  lobster resources [名字]         查看资源
  lobster give <from> <to> <资源> <数量>  赠送资源
  lobster exchange <名字> <从> <到> <数量>  兑换资源

任务系统:
  lobster tasks [名字]            查看今日任务
  lobster complete <名字> <任务ID> 完成任务
  lobster checkin [名字]          签到

升级:
  lobster breakthrough [名字]       境界突破
  lobster promote [名字]           段位晋升
  lobster evolve [名字]            双视角进化

其他:
  lobster leaderboard [realm|rank|active|streak]  排行榜
  lobster stats                   全局统计
  lobster health                  健康检查

示例:
  lobster status 小溪
  lobster join 小隐 yankel-121160-coder
  lobster tasks
  lobster complete 小溪 read
  lobster checkin 小溪
  lobster leaderboard realm

连接其他服务器:
  LOBSTER_HOST=45.32.13.111 LOBSTER_PORT=9882 node cli.js status 小溪
`);
        break;
    }
  } catch (e) {
    console.error('错误:', e.message);
    process.exit(1);
  }
}

main();
