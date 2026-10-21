import 'server-only'
import { getEnv } from './env'

const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = 'mistral-small-latest'
const TIMEOUT_MS = 12_000

export type MistralChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class MistralRequestError extends Error {
  readonly status: number
  readonly retryAfterSec: number | null

  constructor(status: number, retryAfterSec: number | null = null) {
    super(`Mistral request failed (${status})`)
    this.name = 'MistralRequestError'
    this.status = status
    this.retryAfterSec = retryAfterSec
  }
}

function parseRetryAfter(res: Response): number | null {
  const raw = res.headers.get('retry-after')
  if (!raw) return null
  const asNumber = Number(raw)
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.ceil(asNumber)
  }
  const asDate = Date.parse(raw)
  if (!Number.isNaN(asDate)) {
    return Math.max(0, Math.ceil((asDate - Date.now()) / 1000))
  }
  return null
}

export async function mistralChat(messages: MistralChatMessage[]): Promise<string> {
  const key = getEnv().mistralApiKey
  if (!key) {
    throw new MistralRequestError(503)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 220,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new MistralRequestError(res.status, parseRetryAfter(res))
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new MistralRequestError(502)
    }
    return content
  } finally {
    clearTimeout(timer)
  }
}
