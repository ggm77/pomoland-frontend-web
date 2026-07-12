import { makeGrid } from './mockGrid'
import type { RankingEntry, StatsBar } from '../types'

export const MAP_COLS = 14
export const MAP_ROWS = 8

export function createMapTiles() {
  return makeGrid(
    MAP_COLS,
    MAP_ROWS,
    new Set(['2,2', '2,3', '3,2', '3,3', '3,4', '4,3', '4,4', '2,4']),
    new Set(['9,1', '9,2', '10,1', '10,2', '10,3', '11,2', '8,5', '9,5']),
    new Set(['2,1', '1,2', '1,3', '4,2', '5,3', '5,4', '4,5', '3,5']),
  )
}

export const ONBOARDING_COLS = 12
export const ONBOARDING_ROWS = 6

export function createOnboardingTiles() {
  return makeGrid(
    ONBOARDING_COLS,
    ONBOARDING_ROWS,
    new Set(['6,2']),
    new Set(['1,0', '2,0', '1,1', '9,4', '10,4', '10,5']),
    new Set(['5,2', '7,2', '6,1', '6,3']),
  )
}

export const DAILY_STATS: StatsBar[] = [
  { label: '월', minutes: 140 },
  { label: '화', minutes: 95 },
  { label: '수', minutes: 180 },
  { label: '목', minutes: 60 },
  { label: '금', minutes: 200 },
  { label: '토', minutes: 40 },
  { label: '일', minutes: 20 },
]

export const WEEKLY_STATS: StatsBar[] = [
  { label: '1주차', minutes: 620 },
  { label: '2주차', minutes: 810 },
  { label: '3주차', minutes: 540 },
  { label: '4주차', minutes: 900 },
]

export const RANKING_LIST: RankingEntry[] = [
  { rank: 1, name: '공부머신', tiles: 42, time: '21시간 10분' },
  { rank: 2, name: '열공왕', tiles: 38, time: '19시간 45분' },
  { rank: 3, name: '새벽반', tiles: 31, time: '17시간 05분' },
  { rank: 4, name: '도서관지박령', tiles: 27, time: '15시간 30분' },
]

export const MORE_RANKING_LIST: RankingEntry[] = [
  { rank: 5, name: '카페인중독', tiles: 24, time: '14시간 15분' },
  { rank: 6, name: '밤샘요정', tiles: 20, time: '12시간 50분' },
  { rank: 7, name: '노트정리왕', tiles: 18, time: '11시간 40분' },
  { rank: 8, name: '집중력갑', tiles: 15, time: '10시간 05분' },
]

export const MY_RANKING = { rank: 12, name: 'GGM77', tiles: 15, time: '6시간 40분' }
