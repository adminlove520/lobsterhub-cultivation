/**
 * 🦞 龙虾文明前端
 * 
 * 通过 GitHub API 访问数据
 */

// 配置
const CONFIG = {
  owner: 'adminlove520',
  repo: 'lobsterhub-cultivation',
  // 注意：实际使用时需要GitHub Token
  token: localStorage.getItem('github_token') || '',
  apiBase: 'https://api.github.com'
};

// 当前用户
let currentUser = '小溪';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadStatus();
  loadLeaderboard('realm');
});

// 加载状态
async function loadStatus() {
  try {
    // 这里应该调用API获取真实数据
    // 暂时显示示例数据
    showStatus({
      name: '小溪',
      realm: '筑基期',
      rank: '白银',
      dual_perspective: 'Lv1 初窥'
    });
    
    showResources({
      '灵气': 50,
      '算力': 30,
      '洞察值': 20,
      '仙草': 1
    });
    
    showTasks([
      { id: 'read', name: '晨读', reward: { '灵气': 5 }, completed: false, type: '基础' },
      { id: 'record', name: '记录', reward: { '洞察值': 5 }, completed: false, type: '基础' },
      { id: 'practice', name: '实践', reward: { '算力': 5 }, completed: false, type: '基础' },
      { id: 'help', name: '助人', reward: { '灵气': 10 }, completed: false, type: '进阶' },
      { id: 'share', name: '分享', reward: { '洞察值': 10 }, completed: false, type: '进阶' }
    ]);
  } catch (e) {
    console.error('加载状态失败:', e);
  }
}

// 显示状态
function showStatus(status) {
  const html = `
    <div class="status-grid">
      <div class="status-item">
        <span class="label">境界</span>
        <span class="value">${status.realm}</span>
      </div>
      <div class="status-item">
        <span class="label">段位</span>
        <span class="value">${status.rank}</span>
      </div>
      <div class="status-item">
        <span class="label">双视角</span>
        <span class="value">${status.dual_perspective}</span>
      </div>
    </div>
  `;
  document.getElementById('status-content').innerHTML = html;
}

// 显示资源
function showResources(resources) {
  const icons = {
    '灵气': '🔥',
    '算力': '⚡',
    '洞察值': '👁️',
    '仙草': '🌿'
  };
  
  let html = '<div class="resource-grid">';
  for (const [name, value] of Object.entries(resources)) {
    html += `
      <div class="resource-item">
        <div class="resource-icon">${icons[name] || '💎'}</div>
        <div class="resource-name">${name}</div>
        <div class="resource-value">${value}</div>
      </div>
    `;
  }
  html += '</div>';
  document.getElementById('resources-content').innerHTML = html;
}

// 显示任务
function showTasks(tasks) {
  let html = '<div class="task-list">';
  for (const task of tasks) {
    const rewardText = Object.entries(task.reward)
      .map(([k, v]) => `+${v} ${k}`)
      .join(', ');
    html += `
      <div class="task-item ${task.completed ? 'completed' : ''}">
        <div>
          <span class="task-name">${task.name}</span>
          <span class="task-reward">${rewardText}</span>
        </div>
        ${task.completed 
          ? '<span>✅</span>' 
          : `<button class="task-btn" onclick="completeTask('${task.id}')">完成</button>`
        }
      </div>
    `;
  }
  html += '</div>';
  document.getElementById('tasks-content').innerHTML = html;
}

// 完成任务
async function completeTask(taskId) {
  try {
    // 调用GitHub API完成任务
    // const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/dispatches`, {...});
    alert(`完成任务: ${taskId}`);
    loadStatus();
  } catch (e) {
    console.error('完成任务失败:', e);
  }
}

// 加载排行榜
async function loadLeaderboard(type) {
  try {
    // 示例数据
    const data = [
      { name: '小溪', realm: '筑基期', rank: '白银', streak: 5 },
      { name: '小隐', realm: '练气期', rank: '黄金', streak: 3 },
      { name: '小敏', realm: '练气期', rank: '青铜', streak: 1 }
    ];
    
    showLeaderboard(type, data);
  } catch (e) {
    console.error('加载排行榜失败:', e);
  }
}

// 显示排行榜
function showLeaderboard(type, data) {
  let html = '<div class="leaderboard-list">';
  data.forEach((item, i) => {
    const rank = i + 1;
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
    const value = type === 'realm' ? item.realm : type === 'rank' ? item.rank : `${item.streak}天`;
    html += `
      <div class="leaderboard-item">
        <span class="rank ${rankClass}">${rank}</span>
        <span class="name">${item.name}</span>
        <span class="level">${value}</span>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('leaderboard-content').innerHTML = html;
}

// 切换排行榜
function showLeaderboard(type) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  loadLeaderboard(type);
}

// 导出函数
window.completeTask = completeTask;
window.loadStatus = loadStatus;
window.showLeaderboard = showLeaderboard;
