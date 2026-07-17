import { apiRequest } from '../lib/apiClient'
import type { RankingEntryDto } from '../types'

export function getDailyRanking(limit = 100) {
  return apiRequest<RankingEntryDto[]>(`/api/v1/rankings/daily?limit=${limit}`)
}

export function getWeeklyRanking(limit = 100) {
  return apiRequest<RankingEntryDto[]>(`/api/v1/rankings/weekly?limit=${limit}`)
}

export function getTileRanking(limit = 100) {
  return apiRequest<RankingEntryDto[]>(`/api/v1/rankings/tiles?limit=${limit}`)
}

export function getPointRanking(limit = 100) {
  return apiRequest<RankingEntryDto[]>(`/api/v1/rankings/points?limit=${limit}`)
}
