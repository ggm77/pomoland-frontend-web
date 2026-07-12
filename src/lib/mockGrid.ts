import type { Tile } from '../types'

export function makeGrid(
  cols: number,
  rows: number,
  mineSet: Set<string>,
  otherSet: Set<string>,
  captureSet: Set<string>,
): Tile[] {
  const tiles: Tile[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${col},${row}`
      const state = mineSet.has(key) ? 'mine' : otherSet.has(key) ? 'other' : 'empty'
      const capturable = captureSet.has(key) && state === 'empty'
      tiles.push({
        key,
        col,
        row,
        state,
        capturable,
        owner: state === 'mine' ? '나' : state === 'other' ? '열공왕' : undefined,
        defense: state !== 'empty' ? 2 : undefined,
      })
    }
  }
  return tiles
}
