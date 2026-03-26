// Atlas Tasks Utility Functions
// 通用的样式工具函数

import type { ClassValue } from 'clsx'

// cn 函数 - 条件类名合并
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ')
}

// 生成优先级徽章样式类
export const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'badge flex items-center gap-1.5 badge-priority-low'
    case 'medium':
      return 'badge flex items-center gap-1.5 badge-priority-medium'
    case 'high':
      return 'badge flex items-center gap-1.5 badge-priority-high'
    default:
      return 'badge flex items-center gap-1.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}
