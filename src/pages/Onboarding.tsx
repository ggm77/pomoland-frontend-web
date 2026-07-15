import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TileGrid from '../components/TileGrid'
import { getMapTiles } from '../api/mapApi'
import { putMySettings, setSpawnPoint } from '../api/userApi'
import { mapDtoToTiles } from '../lib/mapTransform'
import type { Tile } from '../types'
import './Onboarding.css'

const SESSION_STEP_MINUTES = 5

function roundToStep(value: number) {
  if (Number.isNaN(value)) return SESSION_STEP_MINUTES
  const rounded = Math.round(value / SESSION_STEP_MINUTES) * SESSION_STEP_MINUTES
  return Math.max(SESSION_STEP_MINUTES, rounded)
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [cols, setCols] = useState(0)
  const [selected, setSelected] = useState<Tile | null>(null)
  const [studyTime, setStudyTime] = useState(25)
  const [restTime, setRestTime] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMapTiles()
      .then((map) => {
        if (cancelled) return
        setCols(map.sizeX)
        setTiles(mapDtoToTiles(map, null))
      })
      .catch(() => {
        if (!cancelled) setError('맵 정보를 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleTileClick(tile: Tile) {
    if (tile.state !== 'empty') return
    setSelected(tile)
  }

  async function handleStart() {
    if (!selected) return
    setSubmitting(true)
    setError(null)
    try {
      await setSpawnPoint(selected.col, selected.row)
      await putMySettings({ studyTime: roundToStep(studyTime), restTime: roundToStep(restTime) })
      navigate('/timer')
    } catch {
      setError('설정 저장에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-card__steps">
          <span className="onboarding-card__step onboarding-card__step--active">STEP 1/2 첫 스폰 타일 선택</span>
          <span>·</span>
          <span>STEP 2/2 세션 설정</span>
        </div>
        <div className="onboarding-card__body">
          <div className="onboarding-card__col">
            <div className="onboarding-card__label">공유 맵 미리보기</div>
            <TileGrid
              cols={cols}
              tiles={tiles}
              tileSize={26}
              selectedKey={selected?.key}
              onTileClick={handleTileClick}
            />
            <div className="onboarding-card__legend">
              <span>■ 선택 타일</span>
              <span>□ 점유 타일</span>
              <span>⬚ 빈 타일 — 선택 가능</span>
            </div>
          </div>
          <div className="onboarding-card__col">
            <div className="onboarding-card__selected">
              <div className="onboarding-card__selected-label">선택 타일</div>
              <div className="onboarding-card__selected-value">
                {selected
                  ? `좌표 (${selected.col}, ${selected.row}) · 빈 타일 — 선택 가능`
                  : '타일을 클릭해 선택하세요'}
              </div>
            </div>
            <div>
              <div className="onboarding-card__label">세션 길이</div>
              <div className="onboarding-card__session-row">
                <label className="onboarding-card__session-field">
                  <input
                    type="number"
                    min={SESSION_STEP_MINUTES}
                    step={SESSION_STEP_MINUTES}
                    className="input onboarding-card__session-input"
                    value={studyTime}
                    onChange={(event) => setStudyTime(Number(event.target.value))}
                    onBlur={(event) => setStudyTime(roundToStep(Number(event.target.value)))}
                  />
                  분 집중
                </label>
                <span>+</span>
                <label className="onboarding-card__session-field">
                  <input
                    type="number"
                    min={SESSION_STEP_MINUTES}
                    step={SESSION_STEP_MINUTES}
                    className="input onboarding-card__session-input"
                    value={restTime}
                    onChange={(event) => setRestTime(Number(event.target.value))}
                    onBlur={(event) => setRestTime(roundToStep(Number(event.target.value)))}
                  />
                  분 휴식
                </label>
              </div>
            </div>
            {error && <div className="onboarding-card__error">{error}</div>}
            <button
              type="button"
              className="btn btn--primary"
              disabled={!selected || submitting}
              onClick={handleStart}
            >
              {submitting ? '설정 중...' : '시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
