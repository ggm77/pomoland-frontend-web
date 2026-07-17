import { apiRequest } from '../lib/apiClient'
import type { UserDto, UserSettingsDto } from '../types'

export function getUser(userId: number) {
  return apiRequest<UserDto>(`/api/v1/users/${userId}`)
}

export function getMe() {
  return apiRequest<UserDto>('/api/v1/users/me')
}

export function updateMe(username: string) {
  return apiRequest<void>('/api/v1/users/me', { method: 'PATCH', body: { username } })
}

export function deleteMe() {
  return apiRequest<void>('/api/v1/users/me', { method: 'DELETE' })
}

export function setSpawnPoint(x: number, y: number) {
  return apiRequest<void>('/api/v1/users/me/spawnpoint', { method: 'POST', body: { x, y } })
}

export function getMySettings() {
  return apiRequest<UserSettingsDto>('/api/v1/users/me/settings')
}

export function putMySettings(settings: UserSettingsDto) {
  return apiRequest<UserSettingsDto>('/api/v1/users/me/settings', {
    method: 'PUT',
    body: settings,
  })
}
