import { useEffect, useRef } from 'react'
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

export default function TileGrid({ cols, tiles, selectedKey, tileSize = 34, centerKey, onTileClick }: TileGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centeredKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !centerKey || tiles.length === 0) return
    if (centeredKeyRef.current === centerKey) return
    const target = container.querySelector<HTMLElement>(`[data-tile-key="${centerKey}"]`)
    if (!target) return

    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const targetLeft = targetRect.left - containerRect.left + container.scrollLeft
    const targetTop = targetRect.top - containerRect.top + container.scrollTop

    container.scrollLeft = targetLeft - container.clientWidth / 2 + target.clientWidth / 2
    container.scrollTop = targetTop - container.clientHeight / 2 + target.clientHeight / 2
    centeredKeyRef.current = centerKey
  }, [centerKey, tiles])

  return (
    <div
      ref={containerRef}
      className="tile-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`, gridAutoRows: `${tileSize}px` }}
    >
      {tiles.map((tile) => (
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
          style={{ width: tileSize, height: tileSize }}
          aria-label={`타일 (${tile.col}, ${tile.row})`}
        />
      ))}
    </div>
  )
}
