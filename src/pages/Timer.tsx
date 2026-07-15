import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { abandonSession, completeSession, heartbeatSession, startSession } from '../api/sessionApi'
import { getMe, getMySettings } from '../api/userApi'
import './Timer.css'

const DEFAULT_FOCUS_SECONDS = 25 * 60
const DEFAULT_BREAK_SECONDS = 5 * 60
const HEARTBEAT_INTERVAL_MS = 15_000
const AWAY_ABANDON_MS = 5_000

type Phase = 'focus' | 'break'

const DIAL_RADIUS = 121
const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS

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
  const [points, setPoints] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [sessionUuid, setSessionUuid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hidden, setHidden] = useState(document.hidden)
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
        const rest = settings.restTime * 60
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
    function handleVisibilityChange() {
      setHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (!running || phase !== 'focus' || !sessionUuid || hidden) return
    heartbeatRef.current = window.setInterval(() => {
      heartbeatSession(sessionUuid).catch(() => {})
    }, HEARTBEAT_INTERVAL_MS)
    return () => {
      if (heartbeatRef.current !== null) window.clearInterval(heartbeatRef.current)
    }
  }, [running, phase, sessionUuid, hidden])

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return
    if (phase === 'focus') {
      const finishingUuid = sessionUuid
      setSessionUuid(null)
      if (finishingUuid) {
        completeSession(finishingUuid)
          .then(() => refreshMe())
          .catch(() => setError('세션 완료 처리에 실패했습니다.'))
      }
      setShowComplete(true)
      setPhase('break')
      setSecondsLeft(breakSeconds)
    } else {
      setRunning(false)
      setPhase('focus')
      setSecondsLeft(focusSeconds)
    }
  }, [secondsLeft, running, phase, sessionUuid, focusSeconds, breakSeconds, refreshMe])

  async function handleStart() {
    if (running) return
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

  const handleGiveUp = useCallback(async () => {
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
  }, [sessionUuid, phase, focusSeconds, breakSeconds])

  useEffect(() => {
    if (!running) return
    let timeoutId: number | null = null

    function handleVisibilityChange() {
      if (document.hidden) {
        timeoutId = window.setTimeout(() => {
          handleGiveUp()
        }, AWAY_ABANDON_MS)
      } else if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [running, handleGiveUp])

  function handleDismissComplete() {
    setShowComplete(false)
  }

  const phaseTotalSeconds = phase === 'focus' ? focusSeconds : breakSeconds
  const dialProgress = phaseTotalSeconds > 0 ? secondsLeft / phaseTotalSeconds : 0
  const dialDashOffset = DIAL_CIRCUMFERENCE * (1 - dialProgress)

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
        </div>
        <div className="timer-page__dial">
          <svg className="timer-page__ring" viewBox="0 0 260 260">
            <circle className="timer-page__ring-track" cx="130" cy="130" r={DIAL_RADIUS} />
            <circle
              className="timer-page__ring-progress"
              cx="130"
              cy="130"
              r={DIAL_RADIUS}
              strokeDasharray={DIAL_CIRCUMFERENCE}
              strokeDashoffset={dialDashOffset}
            />
          </svg>
          <div className="timer-page__time">{formatTime(secondsLeft)}</div>
          <div className="timer-page__phase">{phase === 'focus' ? '집중 중' : '휴식 중'}</div>
        </div>
        {error && <div className="timer-page__error">{error}</div>}
        <div className="timer-page__actions">
          <button type="button" className="btn btn--primary" onClick={handleStart} disabled={running}>
            시작
          </button>
          <button type="button" className="btn btn--outline" onClick={handleGiveUp}>
            포기
          </button>
        </div>
        {running && (
          <div className="timer-page__notice">
            화면 이탈 감지 — 5초 이내에 돌아오지 않으면 이번 세션은 자동으로 포기 처리됩니다.
          </div>
        )}

        {showComplete && (
          <div className="timer-page__complete">
            <div className="timer-page__complete-title">세션 완주! 타일 포인트 +1</div>
            <div className="timer-page__complete-desc">보유 포인트 {points}P · 휴식을 시작합니다</div>
            <div className="timer-page__complete-actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate('/map')}>
                맵으로 이동
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleDismissComplete}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
