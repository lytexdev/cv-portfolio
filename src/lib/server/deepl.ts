import 'server-only'
import { getEnv } from './env'

export async function translateDeToEn(text: string): Promise<string> {
  const key = getEnv().deeplApiKey
  if (!key) {
    throw new Error('DEEPL_API_KEY is not configured')
  }

  const isFree = key.endsWith(':fx')
  const endpoint = isFree
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  const body = new URLSearchParams()
  body.set('text', text)
  body.set('source_lang', 'DE')
  body.set('target_lang', 'EN')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!res.ok) {
    throw new Error(`DeepL request failed (${res.status})`)
  }

  const data = (await res.json()) as {
    translations?: Array<{ text: string }>
  }
  const translated = data.translations?.[0]?.text
  if (!translated) {
    throw new Error('DeepL returned empty translation')
  }
  return translated
}

export async function translateManyDeToEn(texts: string[]): Promise<string[]> {
  const out: string[] = []
  for (const text of texts) {
    out.push(await translateDeToEn(text))
  }
  return out
}
