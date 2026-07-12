import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const [emailChecked, setEmailChecked] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    navigate('/onboarding')
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--tall">
        <form className="auth-card__inner auth-card__inner--form" onSubmit={handleSubmit}>
          <div className="auth-card__heading">회원가입</div>
          <div className="auth-form__row">
            <input placeholder="이메일" className="input" required />
            <button
              type="button"
              className="btn btn--check"
              onClick={() => setEmailChecked(true)}
            >
              {emailChecked ? '확인됨' : '중복 확인'}
            </button>
          </div>
          <div className="auth-form__field">
            <input placeholder="비밀번호" type="password" className="input" required />
            <div className="auth-form__hint">영문/숫자 포함 8자 이상</div>
          </div>
          <input placeholder="비밀번호 확인" type="password" className="input" required />
          <input placeholder="닉네임" className="input" required />
          <label className="auth-form__checkbox">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            이용약관 및 개인정보 처리방침 동의
          </label>
          <button type="submit" className="btn btn--primary" disabled={!agreed}>
            가입하기
          </button>
        </form>
      </div>
    </div>
  )
}
