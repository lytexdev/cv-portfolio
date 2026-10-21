import 'server-only'

export type LogEvent =
  | 'cv_view'
  | 'cv_view_expired'
  | 'cv_token_invalid'
  | 'vcard_download'

const BOT_PATTERN =
  /Slackbot|Slack-ImgProxy|Teams|SkypeUriPreview|LinkedInBot|facebookexternalhit|Twitterbot|Discordbot|WhatsApp|TelegramBot|Googlebot|bingbot/i

export function detectAgent(userAgent: string | null): 'bot' | 'browser' {
  if (!userAgent) {
    return 'browser'
  }
  return BOT_PATTERN.test(userAgent) ? 'bot' : 'browser'
}

export function logEvent(payload: {
  evt: LogEvent
  tokenId?: string
  lang: string
  agent: 'bot' | 'browser'
}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    evt: payload.evt,
    ...(payload.tokenId ? { tokenId: payload.tokenId } : {}),
    lang: payload.lang,
    agent: payload.agent,
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
  }
  if (key === 'tokens') {
    if (warnedMissingTokens) return
    warnedMissingTokens = true
  }
  if (key === 'legal') {
    if (warnedMissingLegal) return
    warnedMissingLegal = true
  }
  process.stdout.write(
    `${JSON.stringify({ ts: new Date().toISOString(), evt: 'warn', message })}\n`,
  )
}
