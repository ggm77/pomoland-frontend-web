import type { AuthTokens } from '../types'

const STORAGE_KEY = 'pomoland.auth'

export function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function setStoredTokens(tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null
}
