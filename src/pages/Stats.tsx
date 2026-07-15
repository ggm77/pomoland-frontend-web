import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { getMe } from '../api/userApi'
import type { UserDto } from '../types'
import './Stats.css'

type Range = 'daily' | 'weekly'

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}시간 ${minutes}분`
}

export default function Stats() {
  const [range, setRange] = useState<Range>('daily')
  const [me, setMe] = useState<UserDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => setError('통계 정보를 불러오지 못했습니다.'))
  }, [])

  const totalTime = me ? formatSeconds(range === 'daily' ? me.dailyStudyTime : me.weeklyStudyTime) : '-'
  const completedSessions = me?.pomoComplete ?? 0
  const completionRate = me && me.pomoTry > 0 ? Math.round((me.pomoComplete / me.pomoTry) * 100) : 0

  return (
    <div className="stats-page">
      <AppHeader />
      <div className="stats-page__body">
        {error && <div className="stats-page__error">{error}</div>}
        <div className="stats-page__tabs">
          <button
            type="button"
            className={'stats-page__tab' + (range === 'daily' ? ' stats-page__tab--active' : '')}
            onClick={() => setRange('daily')}
          >
            일간
          </button>
          <button
            type="button"
            className={'stats-page__tab' + (range === 'weekly' ? ' stats-page__tab--active' : '')}
            onClick={() => setRange('weekly')}
          >
            주간
          </button>
        </div>
        <div className="stats-page__summary">
          <div className="stats-page__card">
            <div className="stats-page__card-label">총 공부 시간</div>
            <div className="stats-page__card-value">{totalTime}</div>
          </div>
          <div className="stats-page__card">
            <div className="stats-page__card-label">완주 세션 · 포인트</div>
            <div className="stats-page__card-value">
              {completedSessions}회 · {me?.point ?? 0}P
            </div>
          </div>
          <div className="stats-page__card">
            <div className="stats-page__card-label">세션 완주율</div>
            <div className="stats-page__card-value stats-page__card-value--accent">{completionRate}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
