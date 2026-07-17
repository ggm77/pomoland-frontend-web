import type { AuthTokens } from '../types'

const STORAGE_KEY = 'pomoland.auth'

type TokensChangedListener = (tokens: AuthTokens | null) => void
let onTokensChanged: TokensChangedListener | null = null

// apiClient가 토큰 저장/삭제 시점에 선제적 갱신 타이머를 (재)스케줄링할 수 있도록 알림을 받는다.
export function setTokensChangedListener(listener: TokensChangedListener | null) {
  onTokensChanged = listener
}

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
  onTokensChanged?.(tokens)
}

export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEY)
  onTokensChanged?.(null)
}

// 다른 탭에서 토큰이 갱신/삭제되면 이 탭의 선제적 갱신 스케줄도 최신 상태로 맞춘다.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    onTokensChanged?.(getStoredTokens())
  })
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null
}
