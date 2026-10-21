import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { getAdminSession } from '@/lib/server/session'
import { createCsrfToken } from '@/lib/server/csrf'
import {
  enableTotpAction,
  getTotpSetup,
  setupCredentialsAction,
  skipTotpAction,
} from '../actions'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{ error?: string; totp?: string }>
}

export default async function SudoSetupPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) redirect('/sudo/login')
  const query = await searchParams
  const csrf = await createCsrfToken(String(session.adminId))

  if (query.totp === '1' || !session.mustChange) {
    const setup = await getTotpSetup(session.username)
    const qr = await QRCode.toDataURL(setup.uri, { margin: 1, width: 220 })

    return (
      <div className={styles.wrap}>
        <div className={styles.card} style={{ maxWidth: 32 * 16, marginInline: 'auto' }}>
          <h1 className={styles.title}>Optional TOTP</h1>
          <p className={styles.muted}>
            Scan the QR code with your authenticator app, then verify a code. You can skip.
          </p>
          {query.error === 'totp' ? (
            <p className={styles.error}>Invalid TOTP code.</p>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="TOTP QR code" width={220} height={220} />
          <p className={styles.muted}>Secret: {setup.secret}</p>
          <form action={enableTotpAction} className={styles.grid}>
            <input type="hidden" name="csrf" value={csrf} />
            <input type="hidden" name="secret" value={setup.secret} />
            <label className={styles.label}>
              Verification code
              <input className={styles.input} name="code" required inputMode="numeric" />
            </label>
            <button className={styles.button} type="submit">
              Enable TOTP
            </button>
          </form>
          <form action={skipTotpAction} style={{ marginTop: '0.75rem' }}>
            <input type="hidden" name="csrf" value={csrf} />
            <button className={styles.button} type="submit">
              Skip for now
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{ maxWidth: 32 * 16, marginInline: 'auto' }}>
        <h1 className={styles.title}>Change credentials</h1>
        <p className={styles.muted}>Required on first login. Choose a new username and password.</p>
        {query.error ? <p className={styles.error}>Please provide a valid username and matching password (min 10).</p> : null}
        <form action={setupCredentialsAction} className={styles.grid}>
          <input type="hidden" name="csrf" value={csrf} />
          <label className={styles.label}>
            New username
            <input className={styles.input} name="username" required minLength={3} />
          </label>
          <label className={styles.label}>
            New password
            <input className={styles.input} name="password" type="password" required minLength={10} />
          </label>
          <label className={styles.label}>
            Confirm password
            <input className={styles.input} name="confirm" type="password" required minLength={10} />
          </label>
          <button className={styles.button} type="submit">
            Save and continue
          </button>
        </form>
      </div>
    </div>
  )
}
