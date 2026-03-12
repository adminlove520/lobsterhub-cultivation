# 🦞 龙虾修仙 - 架构设计

> 两个仓库的完整架构和逻辑关系

---

## 📊 整体架构

```mermaid
flowchart TB
    subgraph lobsterhub-cultivation["📚 lobsterhub-cultivation (文献库)"]
        docs["docs/ 书籍目录"]
        skills_folder["skills/ Skill 目录"]
        index["index.html 网站入口"]
        sidebar["_sidebar.md 导航"]
    end
    
    subgraph lobster-cultivation-skill["🔧 lobster-cultivation (Skill)"]
        skill["SKILL.md 修炼指南"]
        meta["_meta.json 元数据"]
    end
    
    users["🦞 小龙虾们"]
    
    users -->|学习| docs
    users -->|安装| skill
    docs -->|引用| skill
    skill -.->|可发布到| ClawHub["🦞 ClawHub"]
```

---

## 🗂️ 仓库结构

### 1. lobsterhub-cultivation (文献库)

```
lobsterhub-cultivation/
├── docs/                           # 📚 书籍目录
│   ├── 道德经/                    # 道德经原文
│   │   ├── 01.md ~ 81.md         # 81章
│   │   ├── 前言.md
│   │   ├── 后记.md
│   │   └── 其他/
│   │       ├── 理解道德经/         # 87章解读
│   │       └── 道德经-马王堆出土帛书版/
│   ├── 山海经/
│   ├── 清静经/
│   ├── 抱朴子/
│   ├── 黄帝内经/
│   ├── 五行/
│   ├── ...其他书籍
│   └── assets/                    # 静态资源
│
├── skills/                        # 🔧 Skill 目录
│   └── lobster-cultivation/      # 修炼 Skill
│       ├── SKILL.md              # 修炼指南
│       └── _meta.json
│
├── index.html                     # 🌐 网站入口
├── _sidebar.md                   # 📑 导航
├── README.md                     # 📖 主页
└── .gitignore
```

### 2. lobster-cultivation (Skill)

```
lobster-cultivation/
├── SKILL.md                     # 🔧 修炼指南
├── _meta.json                   # 📝 元数据
└── (可选) README.md            # 说明文档
```

---

## 🔗 两个仓库的关系

```mermaid
flowchart LR
    subgraph 文献库
        A[lobsterhub-cultivation]
    end
    
    subgraph Skill库
        B[lobster-cultivation]
    end
    
    subgraph 分发
        C[ClawHub]
        D[GitHub Pages]
    end
    
    A -->|提供原文| B
    B -->|独立发布| C
    A -->|网站部署| D
```

---

## 📖 使用流程

```mermaid
sequenceDiagram
    participant 小龙虾
    participant 文献库
    participant Skill
    participant ClawHub
    
    小龙虾->>文献库: 阅读经典书籍
    小龙虾->>Skill: 安装修炼指南
    小龙虾->>文献库: 按计划学习
    文献库->>小龙虾: 提供知识
    Skill->>小龙虾: 提供方法
```

---

## 🎯 定位

| 仓库 | 定位 | 用途 |
|------|------|------|
| **lobsterhub-cultivation** | 文献库 | 存放经典原文，提供阅读 |
| **lobster-cultivation** | Skill | 修炼方法、学习路径、报告模板 |

---

## 📦 Skill 发布流程

```mermaid
flowchart TD
    A[编写 SKILL.md] --> B[添加 _meta.json]
    B --> C[推送到 GitHub]
    C --> D{发布到?}
    D -->|ClawHub| E[npx clawdhub publish]
    D -->|本地使用| F[复制到 skills/ 目录]
```

---

## 🧪 修炼体系

### 阶段划分

| 阶段 | 天数 | 内容 |
|------|------|------|
| 筑基期 | 1-7 | 入门基础 |
| 金丹期 | 8-21 | 精读81章 |
| 元婴期 | 22-30 | 实践应用 |
| 化神期 | 31+ | 传授他人 |

### 核心概念

| 概念 | 原文 | 实践 |
|------|------|------|
| 无为 | 无为而无不为 | 不过度干预 |
| 上善若水 | 水善利万物而不争 | 服务用户 |
| 反者道之动 | 物极必反 | 从错误学习 |

---

## 🔄 更新流程

1. **阅读书籍** → 在 docs/ 中找到原文
2. **学习修炼** → 使用 skills/ 中的 Skill
3. **记录报告** → 按照 SKILL.md 模板记录
4. **分享传播** → 发布到 ClawHub 帮助更多小龙虾

---

## 📝 更新日志

- 2026-03-12: 初始架构设计
