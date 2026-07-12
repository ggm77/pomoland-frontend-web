import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import './Timer.css'

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60
const TOTAL_SESSIONS = 4

type Phase = 'focus' | 'break'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('focus')
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [running, setRunning] = useState(false)
  const [completedToday, setCompletedToday] = useState(3)
  const [cycleSession, setCycleSession] = useState(2)
  const [points, setPoints] = useState(4)
  const [showComplete, setShowComplete] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return
    setRunning(false)
    if (phase === 'focus') {
      setCompletedToday((prev) => prev + 1)
      setCycleSession((prev) => Math.min(prev + 1, TOTAL_SESSIONS))
      setPoints((prev) => prev + 1)
      setShowComplete(true)
    } else {
      setPhase('focus')
      setSecondsLeft(FOCUS_SECONDS)
    }
  }, [secondsLeft, running, phase])

  function handleStartPause() {
    setRunning((prev) => !prev)
  }

  function handleGiveUp() {
    setRunning(false)
    setSecondsLeft(phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
  }

  function handleContinueFocus() {
    setShowComplete(false)
    setPhase('break')
    setSecondsLeft(BREAK_SECONDS)
    setRunning(true)
  }

  const goalProgress = Math.round((cycleSession / TOTAL_SESSIONS) * 100)

  return (
    <div className="timer-page">
      <AppHeader />
      <div className="timer-page__body">
        <div className="timer-page__stats">
          <span>
            오늘 · 완주 <b>{completedToday}</b>세션
          </span>
          <span>
            보유 <b>{points}P</b>
          </span>
          <span>
            목표 대비 <b>{goalProgress}%</b>
          </span>
        </div>
        <div className="timer-page__dial">
          <div className="timer-page__time">{formatTime(secondsLeft)}</div>
          <div className="timer-page__phase">
            {phase === 'focus' ? '집중 중' : '휴식 중'} ({cycleSession}/{TOTAL_SESSIONS})
          </div>
        </div>
        <div className="timer-page__actions">
          <button type="button" className="btn btn--primary" onClick={handleStartPause}>
            {running ? '일시정지' : '시작'}
          </button>
          <button type="button" className="btn btn--outline" onClick={handleGiveUp}>
            포기
          </button>
        </div>
        <div className="timer-page__notice">
          화면 이탈 감지 — 허용 시간 초과 시 이번 세션은 무효 처리됩니다.
        </div>

        {showComplete && (
          <div className="timer-page__complete">
            <div className="timer-page__complete-title">세션 완주! 타일 포인트 +1</div>
            <div className="timer-page__complete-desc">보유 포인트 {points}P</div>
            <div className="timer-page__complete-actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate('/map')}>
                맵으로 이동
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleContinueFocus}>
                계속 집중
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
