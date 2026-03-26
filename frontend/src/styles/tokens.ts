// Atlas Tasks Design Tokens
// 设计系统tokens - 统一的间距、圆角、阴影、边框等设计元素

export const spacing = {
  // 间距系统 (4px base)
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
}

export const borderRadius = {
  none: '0px',    // 无圆角
  sm: '4px',     // 小圆角
  md: '8px',     // 中圆角
  lg: '12px',     // 大圆角
  xl: '16px',    // 超大圆角
  full: '9999px',   // 完全圆角（pill按钮）
}

export const shadows = {
  // 卡片阴影（极轻微）
  card: '0 1px 3px rgba(0, 0, 0, 0.08)',
  // hover阴影
  cardHover: '0 2px 12px rgba(0, 0, 0, 0.12)',
  // 按钮
  button: '0 1px 3px rgba(0, 0, 0, 0.08)',
}

export const borders = {
  // 边框颜色
  divider: '#F3F4E5',  // 分隔线（极浅灰）
  input: '#F3F4E5',       // 输入框
  button: '#F3F4E5',       // 按钮
} as const
