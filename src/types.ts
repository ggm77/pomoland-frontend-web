export type TileState = 'empty' | 'mine' | 'other'

export interface Tile {
  key: string
  col: number
  row: number
  state: TileState
  capturable: boolean
  owner?: string
  defense?: number
}

export interface RankingEntry {
  rank: number
  name: string
  tiles: number
  time: string
}

export interface StatsBar {
  label: string
  minutes: number
}
