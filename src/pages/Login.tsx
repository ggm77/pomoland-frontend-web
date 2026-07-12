import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()

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
            <button type="button" className="btn btn--outline" onClick={() => navigate('/onboarding')}>
              Google로 계속하기
            </button>
            <button type="button" className="btn btn--outline" onClick={() => navigate('/onboarding')}>
              Apple로 계속하기
            </button>
          </div>
          <button type="button" className="auth-card__link" onClick={() => navigate('/signup')}>
            이메일로 회원가입
          </button>
        </div>
      </div>
    </div>
  )
}
