import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { abandonSession, completeSession, heartbeatSession, startSession } from '../api/sessionApi'
import { getMe, getMySettings } from '../api/userApi'
import './Timer.css'

const DEFAULT_FOCUS_SECONDS = 25 * 60
const DEFAULT_BREAK_SECONDS = 5 * 60
const TOTAL_SESSIONS = 4
const HEARTBEAT_INTERVAL_MS = 15_000

type Phase = 'focus' | 'break'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Timer() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('focus')
  const [focusSeconds, setFocusSeconds] = useState(DEFAULT_FOCUS_SECONDS)
  const [breakSeconds, setBreakSeconds] = useState(DEFAULT_BREAK_SECONDS)
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_SECONDS)
  const [running, setRunning] = useState(false)
  const [completedToday, setCompletedToday] = useState(0)
  const [cycleSession, setCycleSession] = useState(0)
  const [points, setPoints] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [sessionUuid, setSessionUuid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const heartbeatRef = useRef<number | null>(null)

  const refreshMe = useCallback(async () => {
    try {
      const me = await getMe()
      setPoints(me.point)
      setCompletedToday(me.pomoComplete)
    } catch {
      // best-effort refresh; keep last known values
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refreshMe awaits before touching state
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    getMySettings()
      .then((settings) => {
        const focus = settings.studyTime * 60
        const rest = settings.resetTime * 60
        setFocusSeconds(focus)
        setBreakSeconds(rest)
        setSecondsLeft((prev) => (prev === DEFAULT_FOCUS_SECONDS ? focus : prev))
      })
      .catch(() => {
        // fall back to defaults if settings can't be loaded
      })
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (!running || phase !== 'focus' || !sessionUuid) return
    heartbeatRef.current = window.setInterval(() => {
      heartbeatSession(sessionUuid).catch(() => {})
    }, HEARTBEAT_INTERVAL_MS)
    return () => {
      if (heartbeatRef.current !== null) window.clearInterval(heartbeatRef.current)
    }
  }, [running, phase, sessionUuid])

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return
    setRunning(false)
    if (phase === 'focus') {
      const finishingUuid = sessionUuid
      setSessionUuid(null)
      if (finishingUuid) {
        completeSession(finishingUuid)
          .then(() => refreshMe())
          .catch(() => setError('세션 완료 처리에 실패했습니다.'))
      }
      setCycleSession((prev) => Math.min(prev + 1, TOTAL_SESSIONS))
      setShowComplete(true)
    } else {
      setPhase('focus')
      setSecondsLeft(focusSeconds)
    }
  }, [secondsLeft, running, phase, sessionUuid, focusSeconds, refreshMe])

  async function handleStartPause() {
    if (running) {
      setRunning(false)
      return
    }
    if (phase === 'focus' && !sessionUuid) {
      try {
        setError(null)
        const session = await startSession()
        setSessionUuid(session.sessionUuid)
        const totalSeconds = Math.round(
          (new Date(session.endAt).getTime() - new Date(session.startAt).getTime()) / 1000,
        )
        setSecondsLeft(totalSeconds > 0 ? totalSeconds : focusSeconds)
      } catch {
        setError('세션 시작에 실패했습니다.')
        return
      }
    }
    setRunning(true)
  }

  async function handleGiveUp() {
    setRunning(false)
    const abandoningUuid = sessionUuid
    setSessionUuid(null)
    if (abandoningUuid) {
      try {
        await abandonSession(abandoningUuid)
      } catch {
        setError('세션 포기 처리에 실패했습니다.')
      }
    }
    setSecondsLeft(phase === 'focus' ? focusSeconds : breakSeconds)
  }

  function handleContinueFocus() {
    setShowComplete(false)
    setPhase('break')
    setSecondsLeft(breakSeconds)
    setRunning(true)
  }

  const goalProgress = Math.round((cycleSession / TOTAL_SESSIONS) * 100)

  return (
    <div className="timer-page">
      <AppHeader />
      <div className="timer-page__body">
        <div className="timer-page__stats">
          <span>
            누적 · 완주 <b>{completedToday}</b>세션
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
        {error && <div className="timer-page__error">{error}</div>}
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
