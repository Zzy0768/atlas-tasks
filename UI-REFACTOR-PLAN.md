# Atlas Tasks UI 重构计划

## 目标
重构任务管理前端页面，达到现代SaaS产品（类似Linear/Notion）的视觉效果。

## 设计原则

### 视觉风格
- **极简**：去除不必要的装饰，专注内容
- **清晰层级**：合理的间距、对齐、阴影层次
- **柔和配色**：中性灰色调，适当的强调色
- **不刺眼**：避免高对比度，确保可访问性

### 布局结构
- **最大宽度**：1400px（符合现代大屏设计）
- **三栏布局**：To Do / In Progress / Done
- **居中对齐**：内容区居中
- **合理留白**：避免拥挤，保持呼吸感

## 组件重构计划

### 1. 全局样式优化
- [ ] 创建统一的设计tokens文件（colors.ts）
- [ ] 优化 Tailwind 配置，添加自定义颜色
- [ ] 创建统一的阴影和圆角工具类

### 2. Board 页面重构
- [ ] 优化头部设计 - 搜索框、视图切换
- [ ] 优化页面布局 - 侧边距、内容宽度
- [ ] 添加加载状态和骨架屏
- [ ] 优化按钮样式 - 统一大小、圆角

### 3. KanbanBoard 组件重构
- [ ] 优化列标题设计 - 简洁大写字母
- [ ] 添加列分隔线 - 轻微边框
- [ ] 优化任务卡片列表 - 间距、对齐

### 4. TaskCard 组件重构
- [ ] 全新卡片设计
  - 白色背景（#FFFFFF）
  - 柔和阴影：0 1px 0 3px rgba(0, 0, 0, 0.08)
  - 圆角：8px（统一）
  - hover 浮起：8px 投影 + y轴位移
  - 内边距：14px（呼吸感）
  - 按钮重新设计 - 圆形、图标对齐
  - 优先级 tag 设计 - 彩色圆角、柔和配色
  - 标题样式 - 字体大小、颜色、行高优化
  - 元数据布局 - 更好的标签和日期显示

### 5. Members 页面重构
- [ ] 重新设计成员卡片
  - 添加 avatar 显示
  - 优化列表布局 - 网格或列表切换
  - 添加 role badge
  - 搜索和添加用户功能

### 6. 交互优化
- [ ] 添加统一的动画效果
- [ ] 优化按钮 hover 状态
- [ ] 添加模态框动画
- [ ] 添加加载和过渡效果

### 7. 响应式设计
- [ ] 优化移动端适配
- [ ] 添加深色模式优化

## 实施步骤

### 阶段1：样式系统
1. 创建 `frontend/src/styles/colors.ts` - 定义设计系统颜色
2. 创建 `frontend/src/styles/tokens.ts` - 定义间距、圆角、阴影
3. 创建 `frontend/src/styles/utils.ts` - 样式工具函数

### 阶段2：TaskCard 重构
1. 重构卡片布局 - 更新间距、对齐
2. 优化卡片设计 - 白色背景、现代阴影
3. 重新设计按钮 - 统一样式
4. 优化标签显示 - 柔和圆角
5. 优化优先级显示 - 彩色标签设计
6. 改进图标使用 - 统一大小和位置

### 阶段3：KanbanBoard 重构
1. 优化列设计 - 更好的标题样式
2. 添加列分隔线
3. 优化任务列表布局 - 统一间距
4. 改进新建任务表单 - 更好的样式

### 阶段4：Board 页面优化
1. 优化头部布局 - 更好的对齐
2. 优化搜索框 - 现代设计
3. 改进视图切换器 - 更好的视觉反馈
4. 添加加载状态

### 阶段5：交互优化
1. 添加统一的动画配置
2. 优化按钮反馈
3. 改进模态框体验

### 阶段6：成员页面重构
1. 重新设计成员卡片布局
2. 添加 avatar 显示
3. 优化搜索功能
4. 改进列表显示

## 技术栈
- React 18+
- TailwindCSS（已配置）
- lucide-react（图标库）
- dnd-kit（拖拽功能）

## 文件清单

### 需要修改的文件
- `frontend/src/styles/colors.ts` (新建)
- `frontend/src/styles/tokens.ts` (新建)
- `frontend/src/styles/utils.ts` (新建)
- `frontend/src/components/TaskCard.tsx` (重写)
- `frontend/src/components/KanbanBoard.tsx` (重写)
- `frontend/src/pages/Board.tsx` (重写)
- `frontend/src/components/TaskModal.tsx` (优化)
- `frontend/src/components/Members.tsx` (重写)

### 新增组件（可选）
- `frontend/src/components/LoadingSkeleton.tsx` (骨架屏)
- `frontend/src/components/EmptyState.tsx` (空状态)

## 配色方案

### 主色调
- 背景：#FFFFFF (白色)
- 文本：#111827 (深灰)
- 次要文本：#6B7280 (中灰)
- 边框：#E5E7EB (极浅灰)
- 阴影：rgba(0, 0, 0, 0.08) (柔和黑色)

### 强调色
- 主色：#3B82F6 (品牌蓝 - Linear 风格)
- 成功：#10B981A (绿色)
- 警告：#EF4444 (橙色)
- 信息：#3B82F6 (蓝色)
- 中性：#111827 (深灰)

### 优先级配色
- Low：#E5E7EB 背景，文字 #576B5F6
- Medium：#FCD03D 背景，文字 #FFFFFF
- High：#FEE2E2 背景，文字 #FFFFFF

---

**预计工作量**：约 4-6 小时完成所有重构

**下一步**：进入计划模式，等待用户审查批准后开始实施。
