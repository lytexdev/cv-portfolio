import { headers } from 'next/headers'
import { HoneypotLogin } from '@/components/honeypot/HoneypotLogin'
import { writeAudit } from '@/lib/server/audit'
import { checkRateLimit } from '@/lib/server/rate-limit'
import { logEvent } from '@/lib/server/log'

export default async function AdminHoneypotPage() {
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'

  logEvent({ evt: 'honeypot_hit', path: '/admin', ip })
  writeAudit({
    category: 'honeypot',
    event: 'honeypot_hit',
    detail: '/admin',
    ip,
  })
  const rate = checkRateLimit(`honeypot:${ip}`, 5, 10 * 60 * 1000, 30 * 60 * 1000)
  if (!rate.allowed) {
    return <HoneypotLogin locked />
  }

  return <HoneypotLogin />
}
