import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Timer from './pages/Timer'
import Map from './pages/Map'
import Stats from './pages/Stats'
import Ranking from './pages/Ranking'
import Settings from './pages/Settings'
import OAuthCallback from './pages/OAuthCallback'
import { setUnauthorizedHandler } from './lib/apiClient'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => navigate('/login', { replace: true }))
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth2/callback/google" element={<OAuthCallback provider="google" />} />
      <Route path="/oauth2/callback/apple" element={<OAuthCallback provider="apple" />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/timer" element={<Timer />} />
      <Route path="/map" element={<Map />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
