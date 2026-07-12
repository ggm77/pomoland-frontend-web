import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import TileGrid from '../components/TileGrid'
import { MAP_COLS, createMapTiles } from '../lib/mockData'
import type { Tile } from '../types'
import './Map.css'

const CAPTURE_COST = 3
const DEFENSE_COST = 1

export default function Map() {
  const [tiles, setTiles] = useState<Tile[]>(() => createMapTiles())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [points, setPoints] = useState(4)

  const selected = tiles.find((tile) => tile.key === selectedKey) ?? null

  function handleCapture() {
    if (!selected || !selected.capturable || points < CAPTURE_COST) return
    setPoints((prev) => prev - CAPTURE_COST)
    setTiles((prev) =>
      prev.map((tile) =>
        tile.key === selected.key
          ? { ...tile, state: 'mine', owner: '나', defense: 1, capturable: false }
          : tile,
      ),
    )
  }

  function handleDefenseUp() {
    if (!selected || selected.state !== 'mine' || points < DEFENSE_COST) return
    setPoints((prev) => prev - DEFENSE_COST)
    setTiles((prev) =>
      prev.map((tile) =>
        tile.key === selected.key ? { ...tile, defense: (tile.defense ?? 0) + 1 } : tile,
      ),
    )
  }

  return (
    <div className="map-page">
      <AppHeader />
      <div className="map-page__body">
        <div className="map-page__main">
          <div className="map-page__toolbar">
            <div className="map-page__points">
              보유 <b>{points}P</b>
            </div>
            <div className="map-page__updated">10초마다 자동 갱신 · 마지막 갱신 12:05:30</div>
          </div>
          <TileGrid cols={MAP_COLS} tiles={tiles} selectedKey={selectedKey ?? undefined} onTileClick={(tile) => setSelectedKey(tile.key)} />
          <div className="map-page__legend">
            <span>■ 내 영토</span>
            <span>■ 타 유저</span>
            <span>□ 빈 타일</span>
            <span>⬚ 점령 가능(인접)</span>
          </div>
        </div>
        <div className="map-page__panel">
          {selected ? (
            <>
              <div className="map-page__panel-coord">
                타일 ({selected.col}, {selected.row})
              </div>
              <div className="map-page__panel-owner">
                {selected.state === 'empty'
                  ? '빈 타일'
                  : `소유자: ${selected.owner} · 방어력 ${selected.defense}`}
              </div>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selected.capturable || points < CAPTURE_COST}
                onClick={handleCapture}
              >
                점령하기 (필요 {CAPTURE_COST}P)
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={selected.state !== 'mine' || points < DEFENSE_COST}
                onClick={handleDefenseUp}
              >
                방어력 올리기 (+{DEFENSE_COST}P)
              </button>
            </>
          ) : (
            <div className="map-page__panel-owner">타일을 클릭해 정보를 확인하세요</div>
          )}
        </div>
      </div>
    </div>
  )
}
