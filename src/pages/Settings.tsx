import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('GGM77')
  const [editingNickname, setEditingNickname] = useState(false)
  const [draftNickname, setDraftNickname] = useState(nickname)
  const [stealAlert, setStealAlert] = useState(true)

  function handleNicknameSubmit(event: FormEvent) {
    event.preventDefault()
    setNickname(draftNickname.trim() || nickname)
    setEditingNickname(false)
  }

  return (
    <div className="settings-page">
      <AppHeader />
      <div className="settings-page__body">
        <div className="settings-page__row">
          <div>
            <div className="settings-page__row-label">프로필</div>
            {editingNickname ? (
              <form className="settings-page__edit-form" onSubmit={handleNicknameSubmit}>
                <input
                  className="input settings-page__edit-input"
                  value={draftNickname}
                  onChange={(event) => setDraftNickname(event.target.value)}
                  autoFocus
                />
                <button type="submit" className="settings-page__save-btn">
                  저장
                </button>
              </form>
            ) : (
              <div className="settings-page__row-value">닉네임: {nickname}</div>
            )}
          </div>
          <button
            type="button"
            className="settings-page__change-btn"
            onClick={() => {
              setDraftNickname(nickname)
              setEditingNickname((prev) => !prev)
            }}
          >
            {editingNickname ? '취소' : '변경'}
          </button>
        </div>

        <div className="settings-page__card">
          <div className="settings-page__row-label">목표 공부 시간</div>
          <div className="settings-page__row-value">일간 4시간 / 주간 20시간</div>
        </div>

        <div className="settings-page__card">
          <div className="settings-page__row-label">세션 길이</div>
          <div className="settings-page__row-value">집중 25분 + 휴식 5분</div>
          <div className="settings-page__note">※ 커스텀 길이도 포인트는 25분 기준으로 환산됩니다.</div>
        </div>

        <div className="settings-page__row">
          <div className="settings-page__row-value">내 타일 피탈 알림</div>
          <button
            type="button"
            className={'settings-page__toggle' + (stealAlert ? ' settings-page__toggle--on' : '')}
            onClick={() => setStealAlert((prev) => !prev)}
            aria-pressed={stealAlert}
          >
            <span className="settings-page__toggle-knob" />
          </button>
        </div>

        <button type="button" className="settings-page__logout" onClick={() => navigate('/login')}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
