import { useCallback, useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import TileGrid from '../components/TileGrid'
import { getMapTiles, occupyTile, defenseTile } from '../api/mapApi'
import { getMe, getUser } from '../api/userApi'
import { mapDtoToTiles } from '../lib/mapTransform'
import type { Tile } from '../types'
import './Map.css'

const DEFENSE_COST = 1
const REFRESH_INTERVAL_MS = 10_000

function formatClock(date: Date) {
  return date.toLocaleTimeString('ko-KR', { hour12: false })
}

function captureMinPoint(tile: Tile) {
  return tile.state === 'other' ? (tile.defense ?? 0) + 1 : 1
}

function CaptureControl({
  tile,
  points,
  onCapture,
}: {
  tile: Tile
  points: number
  onCapture: (point: number) => void
}) {
  const min = captureMinPoint(tile)
  const [amount, setAmount] = useState(min)
  const invalid = amount < min || amount > points

  return (
    <>
      <div className="map-page__capture-form">
        <label className="map-page__capture-label" htmlFor="capture-amount">
          점령에 사용할 포인트 (최소 {min}P)
        </label>
        <div className="map-page__capture-row">
          <input
            id="capture-amount"
            type="number"
            min={min}
            max={points}
            className="input map-page__capture-input"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
          <div className="map-page__capture-balance">보유 {points}P</div>
        </div>
      </div>
      <button type="button" className="btn btn--primary" disabled={invalid} onClick={() => onCapture(amount)}>
        점령하기 ({amount}P)
      </button>
    </>
  )
}

export default function Map() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [cols, setCols] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [myUserId, setMyUserId] = useState<number | null>(null)
  const [spawnKey, setSpawnKey] = useState<string | undefined>(undefined)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ownerNames, setOwnerNames] = useState<Record<number, string>>({})
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async (userId: number) => {
    try {
      const map = await getMapTiles()
      setCols(map.sizeX)
      setTiles(mapDtoToTiles(map, userId))
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('맵 정보를 불러오지 못했습니다.')
    }
  }, [])

  async function handleManualRefresh() {
    if (myUserId === null || refreshing) return
    setRefreshing(true)
    try {
      await refresh(myUserId)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const me = await getMe()
        if (cancelled) return
        setMyUserId(me.id)
        setPoints(me.point)
        if (me.spawnPoint) setSpawnKey(`${me.spawnPoint.x},${me.spawnPoint.y}`)
        await refresh(me.id)
      } catch {
        if (!cancelled) setError('내 정보를 불러오지 못했습니다.')
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (myUserId === null) return
    const timer = window.setInterval(() => refresh(myUserId), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [myUserId, refresh])

  const selected = tiles.find((tile) => tile.key === selectedKey) ?? null

  useEffect(() => {
    if (!selected || selected.state !== 'other' || !selected.owner) return
    const ownerId = Number(selected.owner)
    if (Number.isNaN(ownerId) || ownerNames[ownerId]) return
    getUser(ownerId)
      .then((user) => setOwnerNames((prev) => ({ ...prev, [ownerId]: user.username })))
      .catch(() => {})
  }, [selected, ownerNames])

  async function handleCapture(capturePoint: number) {
    if (!selected || !selected.capturable || myUserId === null) return
    if (capturePoint < captureMinPoint(selected) || capturePoint > points) return
    try {
      await occupyTile(selected.col, selected.row, capturePoint)
      const me = await getMe()
      setPoints(me.point)
      await refresh(myUserId)
    } catch {
      setError('점령에 실패했습니다.')
    }
  }

  async function handleDefenseUp() {
    if (!selected || selected.state !== 'mine' || points < DEFENSE_COST || myUserId === null) return
    try {
      await defenseTile(selected.col, selected.row, DEFENSE_COST)
      const me = await getMe()
      setPoints(me.point)
      await refresh(myUserId)
    } catch {
      setError('방어력 강화에 실패했습니다.')
    }
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
            <div className="map-page__updated">
              10초마다 자동 갱신 · 마지막 갱신 {lastUpdated ? formatClock(lastUpdated) : '-'}
              <button
                type="button"
                className="map-page__refresh-btn"
                onClick={handleManualRefresh}
                disabled={refreshing || myUserId === null}
              >
                {refreshing ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>
          {error && <div className="map-page__error">{error}</div>}
          <TileGrid
            cols={cols}
            tiles={tiles}
            selectedKey={selectedKey ?? undefined}
            centerKey={spawnKey}
            onTileClick={(tile) => setSelectedKey(tile.key)}
          />
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
                  : `소유자: ${
                      selected.state === 'mine'
                        ? '나'
                        : (ownerNames[Number(selected.owner)] ?? `유저 #${selected.owner}`)
                    } · ${selected.isSpawnPoint ? '스폰포인트' : `방어력 ${selected.defense}`}`}
              </div>
              {selected.capturable && (
                <CaptureControl key={selected.key} tile={selected} points={points} onCapture={handleCapture} />
              )}
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
