import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import { getRanking } from '../api/userApi'
import type { RankingItemDto } from '../types'
import './Ranking.css'

type RankingType = 'time' | 'tile'

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}시간 ${minutes}분`
}

export default function Ranking() {
  const [type, setType] = useState<RankingType>('time')
  const [items, setItems] = useState<RankingItemDto[]>([])
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getRanking(type)
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
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
          <button
            type="button"
            className={'ranking-page__tab' + (type === 'time' ? ' ranking-page__tab--active' : '')}
            onClick={() => setType('time')}
          >
            공부 시간순
          </button>
          <button
            type="button"
            className={'ranking-page__tab' + (type === 'tile' ? ' ranking-page__tab--active' : '')}
            onClick={() => setType('tile')}
          >
            타일순
          </button>
        </div>
        {error && <div className="ranking-page__error">{error}</div>}
        <div className="ranking-page__list">
          {items.map((entry, index) => (
            <div key={entry.id} className="ranking-page__row">
              <span className="ranking-page__rank">{index + 1}위</span>
              <span className="ranking-page__name">{entry.username}</span>
              <span className="ranking-page__tiles">타일 {entry.tileCount}</span>
              <span className="ranking-page__time">{formatMinutes(entry.weeklyStudyTime)}</span>
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
