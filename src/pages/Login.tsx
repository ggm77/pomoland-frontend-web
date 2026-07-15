import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { devLogin } from '../api/authApi'
import { startAppleLogin, startGoogleLogin } from '../lib/oauth'
import { completeLogin } from '../lib/postLogin'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [devUserId, setDevUserId] = useState('')
  const [devLoading, setDevLoading] = useState(false)
  const [devError, setDevError] = useState<string | null>(null)

  async function handleDevLogin(event: FormEvent) {
    event.preventDefault()
    const userId = Number(devUserId)
    if (!Number.isInteger(userId) || userId <= 0) return
    setDevLoading(true)
    setDevError(null)
    try {
      const tokens = await devLogin(userId)
      await completeLogin(tokens, navigate)
    } catch {
      setDevError('개발용 로그인에 실패했습니다.')
      setDevLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__inner">
          <div className="auth-card__brand">
            <div className="auth-card__logo">🔥</div>
            <div className="auth-card__title">뽀모도로 땅따먹기</div>
          </div>
          <p className="auth-card__desc">
            Google 또는 Apple 계정으로 간편하게 시작하세요.
            <br />
            최초 로그인 시 자동으로 회원가입 및 온보딩으로 이동합니다.
          </p>
          <div className="auth-card__actions">
            <button type="button" className="btn btn--outline" onClick={startGoogleLogin}>
              Google로 계속하기
            </button>
            <button type="button" className="btn btn--outline" onClick={startAppleLogin}>
              Apple로 계속하기
            </button>
          </div>
          <button type="button" className="auth-card__link" onClick={() => navigate('/signup')}>
            이메일로 회원가입
          </button>

          <form className="auth-card__dev" onSubmit={handleDevLogin}>
            <div className="auth-card__dev-label">개발용 로그인 (임시)</div>
            <div className="auth-form__row">
              <input
                className="input"
                placeholder="userId"
                inputMode="numeric"
                value={devUserId}
                onChange={(event) => setDevUserId(event.target.value)}
              />
              <button type="submit" className="btn btn--outline" disabled={!devUserId || devLoading}>
                {devLoading ? '로그인 중...' : '개발용 로그인'}
              </button>
            </div>
            {devError && <div className="auth-card__dev-error">{devError}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
