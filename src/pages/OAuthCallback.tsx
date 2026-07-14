import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loginWithApple, loginWithGoogle } from '../api/authApi'
import { getMe } from '../api/userApi'
import { consumeOAuthState } from '../lib/oauth'
import { setStoredTokens } from '../lib/tokenStorage'
import './Auth.css'

interface OAuthCallbackProps {
  provider: 'google' | 'apple'
}

function extractAppleName(searchParams: URLSearchParams) {
  const direct = searchParams.get('name')
  if (direct) return direct
  const userParam = searchParams.get('user')
  if (!userParam) return ''
  try {
    const parsed = JSON.parse(userParam) as { name?: { firstName?: string; lastName?: string } }
    return [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(' ')
  } catch {
    return ''
  }
}

export default function OAuthCallback({ provider }: OAuthCallbackProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    async function run() {
      await Promise.resolve()

      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const oauthError = searchParams.get('error')

      if (oauthError) {
        setError('로그인이 취소되었습니다.')
        return
      }
      if (!code || !consumeOAuthState(provider, state)) {
        setError('로그인 요청이 유효하지 않습니다. 다시 시도해 주세요.')
        return
      }

      try {
        const tokens =
          provider === 'google'
            ? await loginWithGoogle(code)
            : await loginWithApple(code, extractAppleName(searchParams))
        setStoredTokens(tokens)
        try {
          const me = await getMe()
          navigate(me.spawnPoint ? '/timer' : '/onboarding', { replace: true })
        } catch {
          navigate('/onboarding', { replace: true })
        }
      } catch {
        setError('로그인에 실패했습니다.')
      }
    }

    run()
  }, [provider, searchParams, navigate])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__inner">
          <div className="auth-card__brand">
            <div className="auth-card__logo">🔥</div>
            <div className="auth-card__title">뽀모도로 땅따먹기</div>
          </div>
          {error ? (
            <>
              <p className="auth-card__desc">{error}</p>
              <button type="button" className="btn btn--outline" onClick={() => navigate('/login')}>
                로그인으로 돌아가기
              </button>
            </>
          ) : (
            <p className="auth-card__desc">로그인 처리 중입니다...</p>
          )}
        </div>
      </div>
    </div>
  )
}
