import { apiRequest } from '../lib/apiClient'
import type { MapDto, MapTileDto } from '../types'

export function getMapTiles() {
  return apiRequest<MapDto>('/api/v1/map/tiles')
}

export function getMapTile(x: number, y: number) {
  return apiRequest<MapTileDto>(`/api/v1/map/tiles/${x}/${y}`)
}

export function occupyTile(x: number, y: number, point: number) {
  return apiRequest<void>(`/api/v1/map/tiles/${x}/${y}/occupy`, {
    method: 'POST',
    body: { point },
  })
}

export function defenseTile(x: number, y: number, point: number) {
  return apiRequest<void>(`/api/v1/map/tiles/${x}/${y}/defense`, {
    method: 'POST',
    body: { point },
  })
}
