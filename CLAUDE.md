# Atlas Tasks — 开发规范

全栈任务管理应用。React + Vite 前端，Express 后端，SQLite + Prisma，JWT 认证。

## 目录说明

- `frontend/` — React SPA（Vite、TailwindCSS、Zustand）
- `backend/`  — Express API（Prisma、bcrypt、jsonwebtoken、node-cron）
- `shared/`   — 前后端共享 TypeScript 类型

## 开发命令

```bash
npm install              # 安装所有 workspace 依赖
npm run dev              # 同时启动前端(:5173) + 后端(:3001)
npm run build            # 构建前后端
```

```bash
cd backend
npx prisma migrate dev   # 执行数据库迁移
npx prisma studio        # 可视化浏览数据库
npx prisma generate      # 重新生成 Prisma Client
```

## 关键约定

### 类型
- 共享类型统一在 `shared/types.ts` 定义，导入方式：`import type { Task } from "shared"`
- 不要在前后端各自重复定义相同的类型

### 认证
- JWT 存于 Zustand 内存 store，**不要存入 localStorage**（防 XSS）
- 所有受保护路由挂载 `backend/src/middleware/auth.ts`
- 项目成员鉴权在每个 project/task 路由中强制执行

### 数据库
- `Task.labels` 字段以 JSON 字符串存储于 SQLite，在 service 层 parse/stringify
- `Task.order` 整数字段控制看板列内排序，拖拽时调用 `PATCH /api/tasks/:id/reorder`
- `Task.parentTaskId` 自引用，支持子任务层级

### API
- 所有路由前缀 `/api/`
- 输入校验使用 **zod**，在路由层校验，不要在 controller 层重复校验
- 所有路由挂载 rate limiting（`backend/src/middleware/rateLimit.ts`）

### 前端
- 状态管理：Zustand（auth store + theme store）
- HTTP 客户端：axios，实例配置在 `frontend/src/api/client.ts`，含 JWT 拦截器
- 样式：TailwindCSS，深色模式使用 `dark:` 变体，主题状态存 localStorage

### 重复任务
- 调度逻辑在 `backend/src/jobs/recurringTasks.ts`（node-cron）
- `Task.recurrenceRule` 格式：`"daily"` | `"weekly"` | `"monthly"` | `null`

## 环境变量

后端 `backend/.env`（参考 `.env.example`）：
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

前端 `frontend/.env`：
```
VITE_API_URL=http://localhost:3001
```

## 数据模型概览

| 模型 | 说明 |
|------|------|
| User | 用户账号 |
| Project | 项目，含成员关联 |
| ProjectMember | 项目成员（role: owner/member） |
| Task | 任务（含子任务自引用、重复规则） |
| Comment | 任务评论 |
| ActivityLog | 操作历史 |
| Notification | 站内通知 |
