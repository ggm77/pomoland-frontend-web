import { API_BASE_URL } from './config'
import { clearStoredTokens, getAccessToken, getStoredTokens, setStoredTokens } from './tokenStorage'
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

let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<AuthTokens> | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function refreshAccessToken(): Promise<AuthTokens> {
  const refreshToken = getStoredTokens()?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'No refresh token')

  const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) throw new ApiError(response.status, 'Failed to refresh token')

  const tokens = (await response.json()) as AuthTokens
  setStoredTokens(tokens)
  return tokens
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

  if (response.status === 401 && auth && path !== REFRESH_PATH) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      response = await sendRequest(path, method, body, auth)
    } catch {
      // fall through to the 401 handling below
    }
  }

  if (response.status === 401) {
    clearStoredTokens()
    onUnauthorized?.()
    throw new ApiError(401, 'Unauthorized')
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
