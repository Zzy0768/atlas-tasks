# Atlas Tasks

现代化智能任务管理应用，支持个人和团队高效组织与跟踪任务。

## 功能特性

- **任务管理**：增删改查、优先级（低/中/高）、标签、截止日期
- **团队协作**：多用户、项目成员管理、任务分配
- **看板视图**：拖拽排序，按状态（待办/进行中/已完成）分列
- **甘特图视图**：基于开始/截止日期可视化项目进度
- **子任务**：支持任务分解与检查清单
- **评论 & 活动日志**：任务评论线程 + 操作历史记录
- **搜索与筛选**：全文搜索，按负责人/标签/优先级/日期筛选
- **站内通知**：任务分配、截止日临近、新评论提醒
- **重复任务**：支持每日/每周/每月重复规则
- **仪表盘统计**：完成率、逾期任务、项目进度汇总
- **深色模式**：一键切换主题
- **导出 / 导入**：任务数据导出为 CSV/JSON

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS + Zustand |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite + Prisma ORM |
| 认证 | JWT（存于内存，防 XSS） |
| 任务调度 | node-cron（重复任务） |

## 项目结构

```
atlas-tasks/
├── shared/          # 前后端共享 TypeScript 类型
├── frontend/        # React SPA（端口 5173）
├── backend/         # Express API（端口 3001）
│   └── prisma/      # 数据库 schema 与迁移
└── CLAUDE.md        # 开发规范文档
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填写 JWT_SECRET 等配置
```

### 初始化数据库

```bash
cd backend
npx prisma migrate dev
```

### 启动开发服务器

```bash
# 根目录执行，同时启动前后端
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001

### 构建生产版本

```bash
npm run build
```

## API 文档

所有 API 路由以 `/api/` 为前缀，除 `/api/auth/*` 外均需携带 `Authorization: Bearer <token>`。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET/POST | /api/projects | 项目列表/创建 |
| GET/POST | /api/projects/:id/tasks | 任务列表/创建（支持筛选） |
| PATCH/DELETE | /api/tasks/:id | 更新/删除任务 |
| PATCH | /api/tasks/:id/reorder | 看板拖拽排序 |
| GET/POST | /api/tasks/:id/comments | 评论 |
| GET/PATCH | /api/notifications | 通知 |
| GET | /api/projects/:id/stats | 统计数据 |

## 开发规范

详见 [CLAUDE.md](./CLAUDE.md)。

## License

MIT
