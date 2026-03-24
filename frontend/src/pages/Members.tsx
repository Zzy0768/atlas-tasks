import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuthStore } from '../store/auth'
import type { Project, User } from 'shared'

export default function Members() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.user)
  const [project, setProject] = useState<Project | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])

  const load = () => client.get(`/projects/${projectId}`).then(r => setProject(r.data))
  useEffect(() => { load() }, [projectId])

  useEffect(() => {
    if (query.length < 1) return setResults([])
    const t = setTimeout(() =>
      client.get(`/users/search?q=${query}`).then(r => setResults(r.data)), 300)
    return () => clearTimeout(t)
  }, [query])

  const addMember = async (userId: string) => {
    await client.post(`/projects/${projectId}/members`, { userId })
    setQuery(''); setResults([])
    load()
  }

  const removeMember = async (userId: string) => {
    await client.delete(`/projects/${projectId}/members/${userId}`)
    load()
  }

  const myRole = project?.members.find(m => m.userId === currentUser?.id)?.role
  const isOwner = myRole === 'owner'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <button onClick={() => navigate(`/projects/${projectId}/board`)} className="text-blue-500 text-sm">← Board</button>
        <h1 className="font-semibold">Members — {project?.name}</h1>
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        {isOwner && (
          <div className="relative">
            <input className="input w-full" placeholder="Search user to add…" value={query}
              onChange={e => setQuery(e.target.value)} />
            {results.length > 0 && (
              <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow mt-1">
                {results.map(u => (
                  <button key={u.id} onClick={() => addMember(u.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    {u.name} <span className="text-gray-400">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {project?.members.map(m => (
            <div key={m.userId} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm">
              <div>
                <p className="font-medium text-sm">{m.user.name}</p>
                <p className="text-xs text-gray-400">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'owner' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                  {m.role}
                </span>
                {isOwner && m.userId !== currentUser?.id && (
                  <button onClick={() => removeMember(m.userId)}
                    className="text-xs text-red-400 hover:text-red-600">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
