import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Tile } from '../types'
import './TileGrid.css'

interface TileGridProps {
  cols: number
  tiles: Tile[]
  selectedKey?: string
  tileSize?: number
  centerKey?: string
  onTileClick?: (tile: Tile) => void
}

const GRID_GAP = 3
// .tile-grid의 CSS padding과 반드시 일치해야 한다 (스크롤 좌표 계산에 사용).
const GRID_PADDING = 10
// 스크롤 시 빈 화면이 보이지 않도록 뷰포트 밖으로 약간 더 렌더링해둔다.
const OVERSCAN_PX = 200

interface VisibleTile {
  tile: Tile
  row: number
  col: number
}

export default function TileGrid({ cols, tiles, selectedKey, tileSize = 34, centerKey, onTileClick }: TileGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centeredKeyRef = useRef<string | null>(null)
  const [viewport, setViewport] = useState({ scrollTop: 0, scrollLeft: 0, width: 0, height: 0, measured: false })

  const cellSpan = tileSize + GRID_GAP
  const rows = cols > 0 ? Math.ceil(tiles.length / cols) : 0
  const contentWidth = cols > 0 ? cols * cellSpan - GRID_GAP : 0
  const contentHeight = rows > 0 ? rows * cellSpan - GRID_GAP : 0

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    function updateViewport() {
      const el = containerRef.current
      if (!el) return
      setViewport({
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
        width: el.clientWidth,
        height: el.clientHeight,
        measured: true,
      })
    }
    updateViewport()
    container.addEventListener('scroll', updateViewport, { passive: true })
    let resizeObserver: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateViewport)
      resizeObserver.observe(container)
    }
    return () => {
      container.removeEventListener('scroll', updateViewport)
      resizeObserver?.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !centerKey || cols === 0) return
    if (centeredKeyRef.current === centerKey) return
    const index = tiles.findIndex((tile) => tile.key === centerKey)
    if (index === -1) return
    const row = Math.floor(index / cols)
    const col = index % cols
    const targetLeft = GRID_PADDING + col * cellSpan
    const targetTop = GRID_PADDING + row * cellSpan
    container.scrollLeft = targetLeft - container.clientWidth / 2 + tileSize / 2
    container.scrollTop = targetTop - container.clientHeight / 2 + tileSize / 2
    centeredKeyRef.current = centerKey
  }, [centerKey, tiles, cols, cellSpan, tileSize])

  const visibleTiles = useMemo<VisibleTile[]>(() => {
    if (cols === 0 || !viewport.measured) return []

    const minRow = Math.max(0, Math.floor((viewport.scrollTop - OVERSCAN_PX) / cellSpan))
    const maxRow = Math.min(rows - 1, Math.ceil((viewport.scrollTop + viewport.height + OVERSCAN_PX) / cellSpan))
    const minCol = Math.max(0, Math.floor((viewport.scrollLeft - OVERSCAN_PX) / cellSpan))
    const maxCol = Math.min(cols - 1, Math.ceil((viewport.scrollLeft + viewport.width + OVERSCAN_PX) / cellSpan))

    const result: VisibleTile[] = []
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const tile = tiles[row * cols + col]
        if (tile) result.push({ tile, row, col })
      }
    }
    return result
  }, [tiles, cols, rows, viewport, cellSpan])

  return (
    <div ref={containerRef} className="tile-grid">
      <div className="tile-grid__canvas" style={{ width: contentWidth, height: contentHeight }}>
        {visibleTiles.map(({ tile, row, col }) => (
          <button
            key={tile.key}
            data-tile-key={tile.key}
            type="button"
            onClick={() => onTileClick?.(tile)}
            className={
              'tile-grid__tile' +
              ` tile-grid__tile--${tile.state}` +
              (tile.capturable ? ' tile-grid__tile--capturable' : '') +
              (tile.key === selectedKey ? ' tile-grid__tile--selected' : '')
            }
            style={{ width: tileSize, height: tileSize, left: col * cellSpan, top: row * cellSpan }}
            aria-label={`타일 (${tile.col}, ${tile.row})`}
          />
        ))}
      </div>
    </div>
  )
}
