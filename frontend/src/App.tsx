import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'

export default function App() {
  const token = useAuthStore(s => s.token)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/projects/:projectId/board" element={token ? <Board /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
