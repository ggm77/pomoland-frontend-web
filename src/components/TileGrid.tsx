import type { Tile } from '../types'
import './TileGrid.css'

interface TileGridProps {
  cols: number
  tiles: Tile[]
  selectedKey?: string
  tileSize?: number
  onTileClick?: (tile: Tile) => void
}

export default function TileGrid({ cols, tiles, selectedKey, tileSize = 34, onTileClick }: TileGridProps) {
  return (
    <div
      className="tile-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`, gridAutoRows: `${tileSize}px` }}
    >
      {tiles.map((tile) => (
        <button
          key={tile.key}
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
