import { apiRequest } from '../lib/apiClient'
import type { SessionDto } from '../types'

export function startSession() {
  return apiRequest<SessionDto>('/api/v1/session', { method: 'POST' })
}

export function heartbeatSession(sessionUuid: string) {
  return apiRequest<SessionDto>(`/api/v1/session/${sessionUuid}/heartbeat`, { method: 'POST' })
}

export function getSession(sessionUuid: string) {
  return apiRequest<SessionDto>(`/api/v1/session/${sessionUuid}`)
}

export function abandonSession(sessionUuid: string) {
  return apiRequest<SessionDto>(`/api/v1/session/${sessionUuid}/abandon`, { method: 'POST' })
}

export function completeSession(sessionUuid: string) {
  return apiRequest<SessionDto>(`/api/v1/session/${sessionUuid}/complete`, { method: 'POST' })
}
