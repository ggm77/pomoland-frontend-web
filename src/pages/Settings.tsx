import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { deleteMe, getMe, getMySettings, putMySettings, updateMe } from '../api/userApi'
import { clearStoredTokens } from '../lib/tokenStorage'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [editingNickname, setEditingNickname] = useState(false)
  const [draftNickname, setDraftNickname] = useState('')
  const [stealAlert, setStealAlert] = useState(true)
  const [studyTime, setStudyTime] = useState(25)
  const [resetTime, setResetTime] = useState(5)
  const [editingSession, setEditingSession] = useState(false)
  const [draftStudyTime, setDraftStudyTime] = useState(25)
  const [draftResetTime, setDraftResetTime] = useState(5)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe()
      .then((me) => setNickname(me.username))
      .catch(() => setError('내 정보를 불러오지 못했습니다.'))
    getMySettings()
      .then((settings) => {
        setStudyTime(settings.studyTime)
        setResetTime(settings.resetTime)
      })
      .catch(() => setError('설정 정보를 불러오지 못했습니다.'))
  }, [])

  async function handleNicknameSubmit(event: FormEvent) {
    event.preventDefault()
    const next = draftNickname.trim()
    if (!next) {
      setEditingNickname(false)
      return
    }
    try {
      await updateMe(next)
      setNickname(next)
      setEditingNickname(false)
    } catch {
      setError('닉네임 변경에 실패했습니다.')
    }
  }

  async function handleSessionSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      const settings = await putMySettings({ studyTime: draftStudyTime, resetTime: draftResetTime })
      setStudyTime(settings.studyTime)
      setResetTime(settings.resetTime)
      setEditingSession(false)
    } catch {
      setError('세션 길이 변경에 실패했습니다.')
    }
  }

  function handleLogout() {
    clearStoredTokens()
    navigate('/login')
  }

  async function handleWithdraw() {
    const confirmed = window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    if (!confirmed) return
    try {
      await deleteMe()
      clearStoredTokens()
      navigate('/login')
    } catch {
      setError('회원 탈퇴에 실패했습니다.')
    }
  }

  return (
    <div className="settings-page">
      <AppHeader />
      <div className="settings-page__body">
        {error && <div className="settings-page__error">{error}</div>}
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
          {editingSession ? (
            <form className="settings-page__edit-form" onSubmit={handleSessionSubmit}>
              <input
                type="number"
                min={1}
                className="input settings-page__edit-input"
                value={draftStudyTime}
                onChange={(event) => setDraftStudyTime(Number(event.target.value))}
              />
              <span>분 집중 +</span>
              <input
                type="number"
                min={1}
                className="input settings-page__edit-input"
                value={draftResetTime}
                onChange={(event) => setDraftResetTime(Number(event.target.value))}
              />
              <span>분 휴식</span>
              <button type="submit" className="settings-page__save-btn">
                저장
              </button>
            </form>
          ) : (
            <div className="settings-page__row-value">
              집중 {studyTime}분 + 휴식 {resetTime}분
            </div>
          )}
          <button
            type="button"
            className="settings-page__change-btn"
            onClick={() => {
              setDraftStudyTime(studyTime)
              setDraftResetTime(resetTime)
              setEditingSession((prev) => !prev)
            }}
          >
            {editingSession ? '취소' : '변경'}
          </button>
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

        <button type="button" className="settings-page__logout" onClick={handleLogout}>
          로그아웃
        </button>
        <button type="button" className="settings-page__withdraw" onClick={handleWithdraw}>
          회원 탈퇴
        </button>
      </div>
    </div>
  )
}
