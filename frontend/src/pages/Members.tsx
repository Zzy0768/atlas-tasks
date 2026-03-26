import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, X, Crown, User, Search, Mail } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/auth'
import type { Project, User as UserType } from 'shared'

export default function Members() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.user)
  const [project, setProject] = useState<Project | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserType[]>([])

  const load = () => client.get(`/projects/${projectId}`).then(r => setProject(r.data))
  useEffect(() => { load() }, [projectId])

  useEffect(() => {
    if (query.length < 1) return setResults([])
    const t = setTimeout(() =>
      client.get(`/users/search?q=${query}`).then(r => setResults(r.data)), 300)
    return () => clearTimeout(t)
  }, [query])

  const addMember = async (userId: string) => {
    await client.post(`/projects/${projectId}/members`, { userId, role: 'member' })
    setQuery('')
    setResults([])
    load()
  }

  const removeMember = async (userId: string) => {
    await client.delete(`/projects/${projectId}/members/${userId}`)
    load()
  }

  const myRole = project?.members.find(m => m.userId === currentUser?.id)?.role
  const isOwner = myRole === 'owner'

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${projectId}/board`)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all -ml-2"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            项目成员
          </h1>
          {project && <span className="text-sm text-[var(--text-tertiary)] ml-2">· {project.name}</span>}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Add Member */}
        {isOwner && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                placeholder="按姓名或邮箱搜索用户..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="absolute z-10 w-full max-w-md mt-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden animate-fade-in">
                {results.map(u => (
                  <button
                    key={u.id}
                    onClick={() => addMember(u.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">{u.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <Mail size={11} />
                        {u.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project?.members.map(m => (
            <div
              key={m.userId}
              className="card p-5 animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-semibold text-white">
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{m.user.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{m.user.email}</p>
                  </div>
                </div>
                {m.role === 'owner' ? (
                  <span className="badge badge-owner">
                    <Crown size={10} />
                    所有者
                  </span>
                ) : (
                  <span className="badge badge-member">
                    <User size={10} />
                    成员
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <span className="text-xs text-[var(--text-tertiary)]">
                  {m.userId === currentUser?.id ? '您' : ''}
                </span>
                {isOwner && m.userId !== currentUser?.id && (
                  <button
                    onClick={() => removeMember(m.userId)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                  >
                    <X size={12} />
                    移除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {project?.members.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
              <User size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">暂无成员</p>
            {isOwner && <p className="text-xs text-[var(--text-tertiary)] mt-1">使用上方搜索框添加成员</p>}
          </div>
        )}
      </main>
    </div>
  )
}
