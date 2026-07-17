import { API_BASE_URL } from './config'
import {
  clearStoredTokens,
  getAccessToken,
  getStoredTokens,
  setStoredTokens,
  setTokensChangedListener,
} from './tokenStorage'
import type { AuthTokens } from '../types'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

const REFRESH_PATH = '/api/v1/auth/token/refresh'
// 브라우저 전역에서 공유되는 락 이름 — 여러 탭이 동시에 리프레시를 시도해도 실제 네트워크 요청은 하나만 나가게 한다.
const REFRESH_LOCK_NAME = 'pomoland-token-refresh'
// exprTime을 "만료까지 남은 초"로 가정한다(백엔드 계약 미확인). 만료 60초 전에 선제적으로 갱신해
// 401 왕복 없이 액세스 토큰을 교체하는 것이 목표이므로, 가정이 틀려도 반응형 401 리프레시가 안전망이 된다.
const PROACTIVE_REFRESH_BUFFER_MS = 60_000
const MAX_PROACTIVE_REFRESH_DELAY_MS = 24 * 60 * 60 * 1000

let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<AuthTokens> | null = null
let proactiveRefreshTimer: number | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

function scheduleProactiveRefresh(tokens: AuthTokens | null) {
  if (proactiveRefreshTimer !== null) {
    window.clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
  if (!tokens) return
  const delay = tokens.exprTime * 1000 - PROACTIVE_REFRESH_BUFFER_MS
  if (!Number.isFinite(delay) || delay <= 0 || delay > MAX_PROACTIVE_REFRESH_DELAY_MS) return
  proactiveRefreshTimer = window.setTimeout(() => {
    ensureFreshToken().catch(() => {
      // 실패해도 다음 401/403 발생 시 반응형 리프레시가 재시도한다
    })
  }, delay)
}

setTokensChangedListener(scheduleProactiveRefresh)
scheduleProactiveRefresh(getStoredTokens())

async function performRefresh(staleRefreshToken: string): Promise<AuthTokens> {
  // 락을 기다리는 동안 다른 탭이 이미 갱신했다면(리프레시 토큰이 이미 바뀌었다면)
  // 중복 네트워크 요청 없이 최신 토큰을 그대로 사용한다.
  const current = getStoredTokens()
  if (current && current.refreshToken !== staleRefreshToken) return current

  const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: staleRefreshToken }),
  })

  if (!response.ok) throw new ApiError(response.status, 'Failed to refresh token')

  const tokens = (await response.json()) as AuthTokens
  setStoredTokens(tokens)
  return tokens
}

async function refreshAccessToken(): Promise<AuthTokens> {
  const refreshToken = getStoredTokens()?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'No refresh token')

  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, () => performRefresh(refreshToken))
  }
  return performRefresh(refreshToken)
}

function ensureFreshToken(): Promise<AuthTokens> {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

function sendRequest(path: string, method: string, body: unknown, auth: boolean) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  let response = await sendRequest(path, method, body, auth)

  if ((response.status === 401 || response.status === 403) && auth && path !== REFRESH_PATH) {
    try {
      await ensureFreshToken()
      response = await sendRequest(path, method, body, auth)
    } catch {
      // fall through to the 401/403 handling below
    }
  }

  if (response.status === 401 || response.status === 403) {
    clearStoredTokens()
    onUnauthorized?.()
    throw new ApiError(response.status, response.status === 401 ? 'Unauthorized' : 'Forbidden')
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new ApiError(response.status, text || response.statusText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
