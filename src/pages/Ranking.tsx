import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import { MORE_RANKING_LIST, MY_RANKING, RANKING_LIST } from '../lib/mockData'
import './Ranking.css'

export default function Ranking() {
  const [list, setList] = useState(RANKING_LIST)
  const [hasMore, setHasMore] = useState(true)

  function handleLoadMore() {
    setList((prev) => [...prev, ...MORE_RANKING_LIST])
    setHasMore(false)
  }

  return (
    <div className="ranking-page">
      <AppHeader />
      <div className="ranking-page__body">
        <div className="ranking-page__hint">랭킹 = 시즌 누적 완주 시간 + 보유 영토 크기 가중 합산</div>
        <div className="ranking-page__me">
          <span>내 순위 {MY_RANKING.rank}위</span>
          <span>{MY_RANKING.name}</span>
          <span>타일 {MY_RANKING.tiles}</span>
          <span>{MY_RANKING.time}</span>
        </div>
        <div className="ranking-page__list">
          {list.map((entry) => (
            <div key={entry.rank} className="ranking-page__row">
              <span className="ranking-page__rank">{entry.rank}위</span>
              <span className="ranking-page__name">{entry.name}</span>
              <span className="ranking-page__tiles">타일 {entry.tiles}</span>
              <span className="ranking-page__time">{entry.time}</span>
            </div>
          ))}
        </div>
        {hasMore && (
          <button type="button" className="ranking-page__more" onClick={handleLoadMore}>
            더보기
          </button>
        )}
        <div className="ranking-page__updated">마지막 갱신 12:05:30</div>
      </div>
    </div>
  )
}
