import {
  APPLE_CLIENT_ID,
  APPLE_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
} from './oauthConfig'

type Provider = 'google' | 'apple'

const STATE_KEY_PREFIX = 'pomoland.oauth.state.'

function generateState() {
  return crypto.randomUUID()
}

export function startGoogleLogin() {
  const state = generateState()
  sessionStorage.setItem(STATE_KEY_PREFIX + 'google', state)
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent select_account',
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function startAppleLogin() {
  const state = generateState()
  sessionStorage.setItem(STATE_KEY_PREFIX + 'apple', state)
  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: APPLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
    state,
  })
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`
}

export function consumeOAuthState(provider: Provider, receivedState: string | null) {
  const key = STATE_KEY_PREFIX + provider
  const expected = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  return Boolean(expected) && expected === receivedState
}
