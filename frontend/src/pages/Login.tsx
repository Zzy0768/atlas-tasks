import { useState } from 'react'
import client from '../api/client'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const setAuth = useAuthStore(s => s.setAuth)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', name: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await client.post(`/auth/${mode}`, form)
      setAuth(data.token, data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Atlas Tasks</h1>
        {mode === 'register' && (
          <input className="input" placeholder="Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        )}
        <input className="input" type="email" placeholder="Email" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <input className="input" type="password" placeholder="Password" value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          {mode === 'login' ? 'Sign In' : 'Register'}
        </button>
        <button type="button" className="text-sm text-blue-500 w-full text-center"
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'Already have an account?'}
        </button>
      </form>
    </div>
  )
}
