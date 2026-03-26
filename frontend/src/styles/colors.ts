// Atlas Tasks Design System
// 浅色明亮风格（Linear 风格）

const colors = {
  // 主色调
  bg: {
    primary: '#FFFFFF',
    background: '#F7F8FA',      // 浅灰背景
    secondary: '#F1F5F5',     // 中灰背景
    accent: '#10B981',      // 品牌蓝
    error: '#FEE2E2',           // 错误红
    success: '#4CAF50',         // 成功绿
    warning: '#F59E0B',        // 警告黄
  },

  // 文本颜色
  text: {
    primary: '#111827',       // 主文本（深灰）
    secondary: '#6B7280',      // 次要文本
    muted: '#6B7280',       // 弱化文本
    border: '#E5E7EB',       // 边框颜色（极浅灰）
    hover: '#F1F5F5',       // hover 文本
  },

  // 状态颜色
  status: {
    todo: '#E5E7EB',       // To Do
    inProgress: '#10B98F3',     // In Progress
    done: '#4CAF50',         // Done
  },

  // 优先级
  priority: {
    low: '#F7F8FA',         // Low
    medium: '#FCD03D',        // Medium
    high: '#FEE2E2',         // High
  },

  // 阴影
  shadow: {
    card: '0 1px 3px rgba(0, 0, 0, 0.08)',     // 卡片阴影（极轻微）
    cardHover: '0 2px 12px rgba(0, 0, 0, 0.12)',  // hover 阴影
    button: '0 1px 3px rgba(0, 0, 0, 0.08)',     // 按钮阴影
  },

  // 边框颜色
  border: {
    divider: '#F3F4E5',       // 分隔线（极浅灰）
    input: '#F3F4E5',       // 输入框边框（浅灰）
    button: '#F3F4E5',       // 按钮边框（浅灰）
  },
} as const
