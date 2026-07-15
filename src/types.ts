export type TileState = 'empty' | 'mine' | 'other'

export interface Tile {
  key: string
  col: number
  row: number
  state: TileState
  capturable: boolean
  owner?: string
  defense?: number
  isSpawnPoint: boolean
}

export interface RankingItemDto {
  id: number
  username: string
  tileCount: number
  dailyStudyTime: number
  weeklyStudyTime: number
  point: number
}

export interface RankingResponseDto {
  items: RankingItemDto[]
}

export interface SessionDto {
  sessionUuid: string
  startAt: string
  endAt: string
  isRunning: boolean
  isComplete: boolean
}

export interface MapTileDto {
  x: number
  y: number
  ownerId: number | null
  defensePower: number
  isSpawnPoint: boolean
}

export interface MapDto {
  sizeX: number
  sizeY: number
  map: MapTileDto[]
}

export interface UserDto {
  id: number
  username: string
  tileCount: number
  dailyStudyTime: number
  weeklyStudyTime: number
  point: number
  pomoTry: number
  pomoComplete: number
  spawnPoint: MapTileDto | null
}

export interface UserSettingsDto {
  studyTime: number
  restTime: number
}

export interface AuthTokens {
  accessToken: string
  tokenType: string
  exprTime: number
  refreshToken: string
}
