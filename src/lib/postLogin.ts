import type { NavigateFunction } from 'react-router-dom'
import { getMe } from '../api/userApi'
import { setStoredTokens } from './tokenStorage'
import type { AuthTokens } from '../types'

export async function completeLogin(tokens: AuthTokens, navigate: NavigateFunction) {
  setStoredTokens(tokens)
  // getMe 실패를 그대로 전파한다 — 여기서 삼키고 /onboarding으로 보내면
  // 이미 스폰포인트가 있는 기존 유저가 일시 오류만으로 온보딩(스폰 재설정)에 갇힐 수 있다.
  // 호출자(OAuthCallback)가 로그인 실패 화면으로 안내한다.
  const me = await getMe()
  navigate(me.spawnPoint ? '/timer' : '/onboarding', { replace: true })
}
