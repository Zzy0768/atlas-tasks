# Atlas Tasks UI 重构实施计划

## 用户确认的设计选择

1. **色彩风格**：浅色明亮（Linear 风格）
2. **卡片阴影**：扁平设计（无阴影）
3. **优先级标签**：彩色徽章
4. **按钮风格**：圆角矩形
5. **创建方式**：内联表单
6. **列宽度**：相等宽度

## 实施计划

### 阶段1：创建设计系统
- [ ] 创建 `frontend/src/styles/colors.ts` - 定义设计系统颜色
- [ ] 创建 `frontend/src/styles/tokens.ts` - 定义间距、圆角、阴影等设计token
- [ ] 创建 `frontend/src/styles/utils.ts` - 样式工具函数
- [ ] 配置 Tailwind 自定义颜色扩展

### 阶段2：TaskCard 组件重构
- [ ] 重新设计卡片布局 - 白色背景、8px圆角
- [ ] 优化按钮样式 - 圆角矩形设计
- [ ] 改进标签显示 - 彩色徽章
- [ ] 优化拖拽手柄 - 添加虚线分隔符
- [ ] 添加 hover 浮起效果 - transform 和 transition
- [ ] 优化元数据布局 - 更好的间距和对齐

### 阶段3：KanbanBoard 组件优化
- [ ] 重新设计列标题 - 简洁大写字母 + 分隔线
- [ ] 优化列布局 - 相等宽度分配
- [ ] 添加列分隔线 - 潜微边框分隔
- [ ] 改进新建任务表单 - 简洁内联输入设计

### 阶段4：Board 页面整体优化
- [ ] 优化头部布局 - 更好的对齐和间距
- [ ] 优化搜索框 - 圆角输入 + 聚焦图标
- [ ] 优化导出菜单 - 下拉菜单设计
- [ ] 添加加载状态 - 骨架屏效果

### 阶段5：Members 页面重构
- [ ] 重新设计成员卡片 - avatar 显示
- [ ] 优化列表布局 - 网格或列表视图
- [ ] 添加 role badge 显示

### 阶段6：交互优化
- [ ] 添加统一动画 - Framer Motion 或简单 CSS transition
- [ ] 优化按钮反馈 - hover 状态和加载提示
- [ ] 添加骨架屏 - 加载状态占位符

## 配色方案

### 品色系统
- **主背景**: #FFFFFF
- **次要背景**: #F7F8FA（浅灰）
- **边框**: #E5E7EB（深灰）
- **文字**: #6B7280（中灰）
- **强调色**: #3B82F6（品牌蓝）- FCD03D（绿色）FEE444（橙色）

### 阴影系统
- **卡片**: box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08)
- **按钮**: box-shadow: 0 2px 3px rgba(0, 0, 0, 0.12)
- **hover 浮起**: transform: translateY(-4px)
- **拖拽**: box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2)

### 圆角
- **按钮**: 8px
- **徽章**: 12px
- **输入框**: 6px

### 间距系统
- **卡片内边距**: 16px
- **卡片间距**: 12px
- **列间距**: 20px
- **页面边距**: 32px

## 组件文件结构

```
frontend/src/
├── styles/
│   ├── colors.ts       # 设计系统颜色
│   ├── tokens.ts       # 设计tokens
│   └── utils.ts        # 工具函数
├── components/
│   ├── TaskCard.tsx      # 任务卡片（重写）
│   ├── KanbanBoard.tsx    # 看板（重写）
│   ├── TaskModal.tsx    # 任务模态框（优化）
│   ├── LoadingSkeleton.tsx  # 骨架屏
│   └── EmptyState.tsx       # 空状态
├── pages/
│   ├── Board.tsx           # 主看板
│   └── Members.tsx          # 成员页面
└── ...
```

## 实施步骤

### 步1：创建设计系统
1. 创建 `frontend/src/styles/colors.ts`
2. 创建 `frontend/src/styles/tokens.ts`
3. 配置 Tailwind 自定义颜色扩展

### 步骤2：重写 TaskCard 组件
1. 清理现有代码，移除调试日志
2. 重新设计卡片布局
3. 实现新的卡片样式
4. 优化按钮和标签显示
5. 添加 hover 效果

### 步骤3：重写 KanbanBoard 组件
1. 优化列标题设计
2. 改进列布局
3. 添加分隔线和徽章计数
4. 优化新建任务表单

### 步骤4：优化 Board 页面
1. 重构头部布局
2. 优化搜索框
3. 优化视图切换

### 步骤5：创建支持组件
1. LoadingSkeleton - 骨架屏
2. EmptyState - 空状态组件

### 步骤6：重构 Members 页面
1. 优化成员卡片设计
2. 添加 avatar 显示

### 步骤7：测试和优化
1. 添加过渡动画
2. 测试交互效果
3. 优化响应速度

## 技术细节

### 优先级样式
```
Low:    bg-brand-bg-100 text-brand-text
Medium:  bg-warning-bg-100 text-warning-text
High:  bg-error-bg-100 text-error-text
```

### 徽章样式
```
<span className="badge flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
  <span className="w-2 h-2 rounded-full" style={{ background: priorityColors.low }}></span>
  {priorityLabel}
</span>
```

### 按钮样式
```
<button className="px-4 py-2 rounded-lg font-medium text-white bg-brand-bg hover:bg-brand-hover transition-colors">
```

## 预计时间
- 步骤1-2：30 分钟
- 步骤2-3：30 分钟
- 步骤3-6：30 分钟
- 步骤4-4：45 分钟
- 步骤5-5：30 分钟
- 步骤6：7：30 分钟

**总计**：约 3.5 小时
