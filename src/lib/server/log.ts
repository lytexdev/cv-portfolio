import 'server-only'

export type LogEvent =
  | 'cv_view'
  | 'cv_view_expired'
  | 'cv_token_invalid'
  | 'cv_token_missing'
  | 'vcard_download'
  | 'honeypot_hit'
  | 'admin_login'
  | 'admin_login_failed'
  | 'admin_bootstrap'
  | 'seed'
  | 'warn'
  | 'error'

const BOT_PATTERN =
  /Slackbot|Slack-ImgProxy|Teams|SkypeUriPreview|LinkedInBot|facebookexternalhit|Twitterbot|Discordbot|WhatsApp|TelegramBot|Googlebot|bingbot/i

export function detectAgent(userAgent: string | null): 'bot' | 'browser' {
  if (!userAgent) {
    return 'browser'
  }
  return BOT_PATTERN.test(userAgent) ? 'bot' : 'browser'
}

export function logEvent(payload: Record<string, unknown> & { evt: string }): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...payload,
  })
  process.stdout.write(`${line}\n`)
}

let warnedMissingPrivate = false
let warnedMissingTokens = false
let warnedMissingLegal = false

export function warnOnce(key: 'private' | 'tokens' | 'legal', message: string): void {
  if (key === 'private') {
    if (warnedMissingPrivate) return
    warnedMissingPrivate = true
  } else if (key === 'tokens') {
    if (warnedMissingTokens) return
    warnedMissingTokens = true
  } else if (key === 'legal') {
    if (warnedMissingLegal) return
    warnedMissingLegal = true
  }
  logEvent({ evt: 'warn', message })
}
