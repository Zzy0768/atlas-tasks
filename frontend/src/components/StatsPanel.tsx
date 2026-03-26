import { CheckCircle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react'
import type { ProjectStats } from 'shared'

interface StatsPanelProps {
  stats: ProjectStats
  totalMembers?: number
  isLoading?: boolean
}

export default function StatsPanel({ stats, totalMembers = 0, isLoading = false }: StatsPanelProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const statCards = [
    {
      title: '总任务',
      value: stats.total,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-900',
      description: '项目总任务数',
    },
    {
      title: '进行中',
      value: stats.inProgress,
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-900',
      description: '当前进行中的任务',
    },
    {
      title: '已完成',
      value: stats.done,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-900',
      description: '已完成的任务',
    },
    {
      title: '完成率',
      value: `${completionRate}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-200 dark:border-violet-900',
      description: '任务完成比例',
      progress: completionRate,
    },
    {
      title: '已逾期',
      value: stats.overdue,
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-900',
      description: '超过截止日期的任务',
    },
    {
      title: '项目成员',
      value: totalMembers,
      icon: <Users className="w-4 h-4" />,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-900',
      description: '项目成员数量',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton w-24 h-5"></div>
              <div className="skeleton w-6 h-6 rounded"></div>
            </div>
            <div className="skeleton w-16 h-8 mb-2"></div>
            <div className="skeleton w-32 h-4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`card p-5 hover-lift border ${card.borderColor} animate-fade-in`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</h3>
            <div className={`p-2 rounded-lg ${card.color}`}>
              {card.icon}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
                {card.value}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {card.description}
              </p>
            </div>

            {card.progress !== undefined && (
              <div className="text-right">
                <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {card.progress}%
                </span>
              </div>
            )}
          </div>

          {card.title === '本周完成' && stats.completedThisWeek > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                <span className="text-[var(--accent-success)] font-medium">
                  +{stats.completedThisWeek}
                </span>{' '}
                本周完成
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}