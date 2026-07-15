import type { NavigateFunction } from 'react-router-dom'
import { getMe } from '../api/userApi'
import { setStoredTokens } from './tokenStorage'
import type { AuthTokens } from '../types'

export async function completeLogin(tokens: AuthTokens, navigate: NavigateFunction) {
  setStoredTokens(tokens)
  try {
    const me = await getMe()
    navigate(me.spawnPoint ? '/timer' : '/onboarding', { replace: true })
  } catch {
    navigate('/onboarding', { replace: true })
  }
}
