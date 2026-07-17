import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { getDailyRanking, getPointRanking, getTileRanking, getWeeklyRanking } from '../api/rankingApi'
import type { RankingEntryDto } from '../types'
import './Ranking.css'

type RankingType = 'daily' | 'weekly' | 'tiles' | 'points'

const TABS: { type: RankingType; label: string }[] = [
  { type: 'daily', label: '일간' },
  { type: 'weekly', label: '주간' },
  { type: 'tiles', label: '타일순' },
  { type: 'points', label: '포인트순' },
]

function fetchRanking(type: RankingType) {
  switch (type) {
    case 'daily':
      return getDailyRanking()
    case 'weekly':
      return getWeeklyRanking()
    case 'tiles':
      return getTileRanking()
    case 'points':
      return getPointRanking()
  }
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}시간 ${minutes}분`
}

export default function Ranking() {
  const [type, setType] = useState<RankingType>('daily')
  const [items, setItems] = useState<RankingEntryDto[]>([])
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchRanking(type)
      .then((res) => {
        if (cancelled) return
        setItems(res)
        setUpdatedAt(new Date())
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('랭킹 정보를 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [type])

  return (
    <div className="ranking-page">
      <AppHeader />
      <div className="ranking-page__body">
        <div className="ranking-page__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              type="button"
              className={'ranking-page__tab' + (type === tab.type ? ' ranking-page__tab--active' : '')}
              onClick={() => setType(tab.type)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {error && <div className="ranking-page__error">{error}</div>}
        <div className="ranking-page__list">
          {items.map((entry) => (
            <div key={entry.userId} className="ranking-page__row">
              <span className="ranking-page__rank">{entry.rank}위</span>
              <span className="ranking-page__name">{entry.username}</span>
              <span className="ranking-page__tiles">타일 {entry.tileCount}</span>
              <span className="ranking-page__points">{entry.point}P</span>
              <span className="ranking-page__time">{formatDuration(entry.studyTime)}</span>
            </div>
          ))}
        </div>
        {updatedAt && (
          <div className="ranking-page__updated">
            마지막 갱신 {updatedAt.toLocaleTimeString('ko-KR', { hour12: false })}
          </div>
        )}
      </div>
    </div>
  )
}
