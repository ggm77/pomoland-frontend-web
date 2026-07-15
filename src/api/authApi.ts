import { apiRequest } from '../lib/apiClient'
import type { AuthTokens } from '../types'

export function loginWithGoogle(code: string) {
  return apiRequest<AuthTokens>('/api/v1/auth/oauth2/google', {
    method: 'POST',
    body: { code },
    auth: false,
  })
}

export function loginWithApple(code: string, name: string) {
  return apiRequest<AuthTokens>('/api/v1/auth/oauth2/apple', {
    method: 'POST',
    body: { code, name },
    auth: false,
  })
}

// 개발용 임시 로그인. 운영 배포 전 제거할 것.
export function devLogin(userId: number) {
  return apiRequest<AuthTokens>(`/api/v1/auth/dev/token?userId=${userId}`, { auth: false })
}
