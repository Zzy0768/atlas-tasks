import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-xl font-bold">Atlas Tasks</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={toggle} className="text-sm px-2 py-1 rounded border dark:border-gray-600">
            {dark ? '☀️' : '🌙'}
          </button>
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500">Logout</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <form onSubmit={createProject} className="flex gap-2">
          <input className="input flex-1" placeholder="New project name…" value={newName}
            onChange={e => setNewName(e.target.value)} />
          <button type="submit" className="btn-primary">Create</button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => {
            const s = stats[p.id]
            return (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}/board`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow cursor-pointer hover:shadow-md transition">
                <h2 className="font-semibold text-lg mb-2">{p.name}</h2>
                {s && (
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex gap-4">
                      <span>Total: {s.total}</span>
                      <span className="text-green-500">Done: {s.done}</span>
                      <span className="text-red-500">Overdue: {s.overdue}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: s.total ? `${(s.done / s.total) * 100}%` : '0%' }} />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{p.members.length} member(s)</p>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
