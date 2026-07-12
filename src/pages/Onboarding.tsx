import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TileGrid from '../components/TileGrid'
import { ONBOARDING_COLS, createOnboardingTiles } from '../lib/mockData'
import type { Tile } from '../types'
import './Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const tiles = useMemo(() => createOnboardingTiles(), [])
  const [selected, setSelected] = useState<Tile | null>(null)

  function handleTileClick(tile: Tile) {
    if (tile.state !== 'empty') return
    setSelected(tile)
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-card__steps">
          <span className="onboarding-card__step onboarding-card__step--active">STEP 1/2 첫 스폰 타일 선택</span>
          <span>·</span>
          <span>STEP 2/2 목표 설정</span>
        </div>
        <div className="onboarding-card__body">
          <div className="onboarding-card__col">
            <div className="onboarding-card__label">공유 맵 미리보기</div>
            <TileGrid
              cols={ONBOARDING_COLS}
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
              <div className="onboarding-card__label">목표 공부 시간</div>
              <div className="onboarding-card__goal-row">
                <div className="onboarding-card__goal">
                  일간 <b>4</b>시간
                </div>
                <div className="onboarding-card__goal">
                  주간 <b>20</b>시간
                </div>
              </div>
            </div>
            <div>
              <div className="onboarding-card__label">세션 길이</div>
              <div className="onboarding-card__goal">
                집중 <b>25</b>분 + 휴식 <b>5</b>분
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!selected}
              onClick={() => navigate('/timer')}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
