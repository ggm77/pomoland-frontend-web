import { useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { DAILY_STATS, WEEKLY_STATS } from '../lib/mockData'
import './Stats.css'

type Range = 'daily' | 'weekly'

function summarize(minutesList: number[]) {
  const totalMinutes = minutesList.reduce((sum, m) => sum + m, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}시간 ${minutes}분`
}

export default function Stats() {
  const [range, setRange] = useState<Range>('daily')
  const bars = range === 'daily' ? DAILY_STATS : WEEKLY_STATS

  const maxMinutes = useMemo(() => Math.max(...bars.map((bar) => bar.minutes)), [bars])
  const totalTime = useMemo(() => summarize(bars.map((bar) => bar.minutes)), [bars])
  const completedSessions = range === 'daily' ? 8 : 26
  const completionRate = range === 'daily' ? 80 : 74

  return (
    <div className="stats-page">
      <AppHeader />
      <div className="stats-page__body">
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
            <div className="stats-page__card-value">{completedSessions}회 · {completedSessions}P</div>
          </div>
          <div className="stats-page__card">
            <div className="stats-page__card-label">세션 완주율</div>
            <div className="stats-page__card-value stats-page__card-value--accent">{completionRate}%</div>
          </div>
        </div>
        <div className="stats-page__chart-card">
          <div className="stats-page__chart-label">{range === 'daily' ? '일별 공부 시간' : '주별 공부 시간'}</div>
          <div className="stats-page__chart">
            {bars.map((bar) => (
              <div key={bar.label} className="stats-page__bar-col">
                <div
                  className="stats-page__bar"
                  style={{
                    height: `${Math.round((bar.minutes / maxMinutes) * 150)}px`,
                    opacity: bar.minutes === maxMinutes ? 1 : 0.55,
                  }}
                />
                <div className="stats-page__bar-label">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
