import 'server-only'
import { getEnv } from './env'

const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = 'mistral-small-latest'
const TIMEOUT_MS = 12_000

export type MistralChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function mistralChat(messages: MistralChatMessage[]): Promise<string> {
  const key = getEnv().mistralApiKey
  if (!key) {
    throw new Error('MISTRAL_AI_API_KEY is not configured')
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
      throw new Error(`Mistral request failed (${res.status})`)
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('Mistral returned empty content')
    }
    return content
  } finally {
    clearTimeout(timer)
  }
}
