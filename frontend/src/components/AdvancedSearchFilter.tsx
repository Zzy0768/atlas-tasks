import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  User,
  Flag,
  Tag,
  SortAsc,
  SortDesc,
  Clock,
} from 'lucide-react'
import type { TaskStatus, Priority } from 'shared'

interface FilterState {
  q: string
  status: TaskStatus | ''
  priority: Priority | ''
  assigneeId: string | ''
  label: string
  dueDate: 'today' | 'tomorrow' | 'week' | 'overdue' | ''
  sortBy: 'created' | 'updated' | 'due' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedSearchFilterProps {
  onFilterChange: (filters: Partial<FilterState>) => void
  availableAssignees: Array<{ id: string; name: string }>
  availableLabels: string[]
  isLoading?: boolean
}

const SORT_OPTIONS = [
  { value: 'created', label: '创建时间', icon: <Clock className="w-3 h-3" /> },
  { value: 'updated', label: '更新时间', icon: <Clock className="w-3 h-3" /> },
  { value: 'due', label: '截止日期', icon: <Calendar className="w-3 h-3" /> },
  { value: 'priority', label: '优先级', icon: <Flag className="w-3 h-3" /> },
  { value: 'title', label: '标题', icon: <SortAsc className="w-3 h-3" /> },
]

const DUE_DATE_OPTIONS = [
  { value: 'today', label: '今天到期' },
  { value: 'tomorrow', label: '明天到期' },
  { value: 'week', label: '本周到期' },
  { value: 'overdue', label: '已逾期' },
]

export default function AdvancedSearchFilter({
  onFilterChange,
  availableAssignees,
  availableLabels,
  isLoading = false,
}: AdvancedSearchFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    status: '',
    priority: '',
    assigneeId: '',
    label: '',
    dueDate: '',
    sortBy: 'created',
    sortOrder: 'desc',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const [labelSuggestions, setLabelSuggestions] = useState<string[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Update parent when filters change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) =>
          value !== '' && value !== null && value !== undefined
        )
      )
      onFilterChange(activeFilters)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters, onFilterChange])

  // Update label suggestions
  useEffect(() => {
    if (labelInput.trim() && availableLabels.length > 0) {
      const suggestions = availableLabels
        .filter(label =>
          label.toLowerCase().includes(labelInput.toLowerCase())
        )
        .slice(0, 5)
      setLabelSuggestions(suggestions)
    } else {
      setLabelSuggestions([])
    }
  }, [labelInput, availableLabels])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: '' }))
  }

  const clearAllFilters = () => {
    setFilters({
      q: '',
      status: '',
      priority: '',
      assigneeId: '',
      label: '',
      dueDate: '',
      sortBy: 'created',
      sortOrder: 'desc',
    })
  }

  const activeFilterCount = Object.values(filters).filter(
    value => value !== '' && value !== null && value !== undefined
  ).length - 2 // Exclude sortBy and sortOrder from count

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
      case 'done': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
      case 'medium': return 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
      case 'high': return 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse-subtle">
        <div className="flex items-center gap-4">
          <div className="skeleton w-64 h-10 rounded-lg"></div>
          <div className="skeleton w-32 h-10 rounded-lg"></div>
          <div className="skeleton w-24 h-10 rounded-lg ml-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      {/* Main search row */}
      <div className="flex items-center gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="搜索任务标题、描述或标签..."
            className="input pl-10 pr-10"
            value={filters.q}
            onChange={e => handleFilterChange('q', e.target.value)}
          />
          {filters.q && (
            <button
              onClick={() => clearFilter('q')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle advanced filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn ${showAdvanced ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Filter className="w-4 h-4" />
          筛选
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-white dark:bg-gray-800 text-[var(--accent-primary)] rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative">
          <button className="btn btn-secondary flex items-center gap-2">
            {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 hidden group-hover:block">
            <div className="p-2">
              <div className="text-xs font-medium text-[var(--text-secondary)] mb-2 px-2">排序方式</div>
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('sortBy', option.value)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded ${
                    filters.sortBy === option.value
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
              <div className="h-px bg-[var(--border-color)] my-2" />
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded"
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                {filters.sortOrder === 'asc' ? '升序' : '降序'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                状态
              </label>
              <div className="flex flex-wrap gap-2">
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', filters.status === status ? '' : status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      filters.status === status
                        ? `${getStatusColor(status)} border-current`
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-hover)]'
                    }`}
                  >
                    {status === 'todo' ? '待办' : status === 'in_progress' ? '进行中' : '已完成'}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                优先级
              </label>
              <div className="flex flex-wrap gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map(priority => (
                  <button
                    key={priority}
                    onClick={() => handleFilterChange('priority', filters.priority === priority ? '' : priority)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      filters.priority === priority
                        ? `${getPriorityColor(priority)} border-current`
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <Flag className="w-3 h-3 inline mr-1" />
                    {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                负责人
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <select
                  className="select pl-10"
                  value={filters.assigneeId}
                  onChange={e => handleFilterChange('assigneeId', e.target.value)}
                >
                  <option value="">全部</option>
                  {availableAssignees.map(assignee => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                截止日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <select
                  className="select pl-10"
                  value={filters.dueDate}
                  onChange={e => handleFilterChange('dueDate', e.target.value)}
                >
                  <option value="">全部</option>
                  {DUE_DATE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Label filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                标签
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="输入标签名称..."
                  className="input pl-10 pr-10"
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && labelInput.trim()) {
                      handleFilterChange('label', labelInput.trim())
                      setLabelInput('')
                    }
                  }}
                />
                {labelInput && (
                  <button
                    onClick={() => {
                      handleFilterChange('label', labelInput.trim())
                      setLabelInput('')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                {/* Label suggestions */}
                {labelSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-10">
                    {labelSuggestions.map(label => (
                      <button
                        key={label}
                        onClick={() => {
                          handleFilterChange('label', label)
                          setLabelInput('')
                          setLabelSuggestions([])
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Active label */}
              {filters.label && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg">
                    <Tag className="w-3 h-3" />
                    {filters.label}
                  </span>
                  <button
                    onClick={() => clearFilter('label')}
                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active filters and clear button */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">
                已应用 {activeFilterCount} 个筛选条件
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
            >
              <X className="w-3 h-3" />
              清除所有筛选
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Add missing Plus import
import { Plus } from 'lucide-react'