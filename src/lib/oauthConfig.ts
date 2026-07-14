export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  '626562885515-istmdil675apt8udcgbvhgk016rt60v5.apps.googleusercontent.com'

export const GOOGLE_REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ??
  'https://pomoland.seohamin.com/oauth2/callback/google'

export const APPLE_CLIENT_ID =
  (import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined) ?? 'com.seohamin.pomo-land'

export const APPLE_REDIRECT_URI =
  (import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined) ??
  'https://pomoland.seohamin.com/oauth2/callback/apple'
