export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  '626562885515-istmdil675apt8udcgbvhgk016rt60v5.apps.googleusercontent.com'

export const GOOGLE_REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ??
  'https://pomoland.seohamin.com/oauth2/callback/google'

export const APPLE_CLIENT_ID =
  (import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined) ?? 'com.seohamin.pomo-land'

// Apple이 POST하는 대상. 백엔드가 이 경로에서 파싱 후 /oauth2/callback/apple(SPA)로 303 리다이렉트한다.
export const APPLE_REDIRECT_URI =
  (import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined) ??
  'https://pomoland.seohamin.com/api/v1/auth/oauth2/callback/apple'
