import styles from '../sudo.module.css'
import { loginAction } from '../actions'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function SudoLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{ maxWidth: 28 * 16, marginInline: 'auto' }}>
        <h1 className={styles.title}>sudo login</h1>
        <p className={styles.muted}>Username, password, admin phrase, and TOTP if enabled.</p>
        {error ? <p className={styles.error}>{error}</p> : null}
        <form action={loginAction} className={styles.grid}>
          <label className={styles.label}>
            Username
            <input className={styles.input} name="username" autoComplete="username" required />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className={styles.label}>
            Admin phrase
            <input className={styles.input} name="phrase" type="password" required />
          </label>
          <label className={styles.label}>
            TOTP (if enabled)
            <input className={styles.input} name="totp" inputMode="numeric" autoComplete="one-time-code" />
          </label>
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
