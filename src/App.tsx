import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Timer from './pages/Timer'
import Map from './pages/Map'
import Stats from './pages/Stats'
import Ranking from './pages/Ranking'
import Settings from './pages/Settings'
import OAuthCallback from './pages/OAuthCallback'
import { setUnauthorizedHandler } from './lib/apiClient'
import { getAccessToken } from './lib/tokenStorage'

// 토큰 존재 여부만으로 판단하는 가벼운 가드. 실제 유효성은 API 401/403 처리(onUnauthorized)가 보장한다.
// 목적은 보안이 아니라, 비로그인 상태에서 보호 페이지 UI가 잠깐 그려졌다가 튕기는 깜빡임을 없애는 것.
function RequireAuth() {
  if (!getAccessToken()) return <Navigate to="/login" replace />
  return <Outlet />
}

function IndexRedirect() {
  return <Navigate to={getAccessToken() ? '/timer' : '/login'} replace />
}

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => navigate('/login', { replace: true }))
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/oauth2/callback/google" element={<OAuthCallback provider="google" />} />
      <Route path="/oauth2/callback/apple" element={<OAuthCallback provider="apple" />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/map" element={<Map />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
