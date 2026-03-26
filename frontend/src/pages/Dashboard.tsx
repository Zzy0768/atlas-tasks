import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, Moon, Sun, ChevronRight, CheckCircle2, AlertCircle, Folder } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import NotificationBell from '../components/NotificationBell'
import type { Project, ProjectStats } from 'shared'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Record<string, ProjectStats>>({})
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    client.get('/projects').then(r => {
      setProjects(r.data)
      r.data.forEach((p: Project) =>
        client.get(`/projects/${p.id}/stats`).then(s => setStats(prev => ({ ...prev, [p.id]: s.data })))
      )
    })
  }, [])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const { data } = await client.post('/projects', { name: newName })
    setProjects(p => [...p, data])
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-[var(--text-primary)]">Atlas Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={toggle} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
            <span className="text-sm text-[var(--text-secondary)] mr-2">{user?.name}</span>
            <button onClick={logout} className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">我的项目</h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{projects.length} 个项目</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={16} />
            新建项目
          </button>
        </div>

        {/* New Project Form */}
        {creating && (
          <form onSubmit={createProject} className="mb-8 max-w-md">
            <input
              autoFocus
              className="input-base mb-3"
              placeholder="项目名称"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                创建项目
              </button>
              <button type="button" onClick={() => setCreating(false)} className="btn btn-secondary">
                取消
              </button>
            </div>
          </form>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
              <Folder size={40} className="text-[var(--text-tertiary)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">还没有项目</h3>
            <p className="text-sm text-[var(--text-tertiary)]">创建一个项目开始管理您的任务</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => {
              const s = stats[p.id]
              const pct = s?.total ? Math.round((s.done / s.total) * 100) : 0
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}/board`)}
                  className="card p-6 text-left group animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Folder size={18} className="text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] leading-tight">{p.name}</h3>
                    </div>
                    <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all" />
                  </div>

                  {s ? (
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <CheckCircle2 size={14} />
                          {s.done}/{s.total} 已完成
                        </span>
                        {s.overdue > 0 && (
                          <span className="flex items-center gap-1.5 text-red-500">
                            <AlertCircle size={14} />
                            {s.overdue} 已逾期
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full" />
                  )}

                  {/* Members */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] mt-4">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {p.members.length} 位成员
                    </span>
                    <div className="flex -space-x-2">
                      {p.members.slice(0, 3).map(m => (
                        <div
                          key={m.userId}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-[var(--bg-primary)] flex items-center justify-center text-xs font-medium text-white"
                          title={m.user.name}
                        >
                          {m.user.name[0].toUpperCase()}
                        </div>
                      ))}
                      {p.members.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-xs font-medium text-[var(--text-tertiary)]">
                          +{p.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
