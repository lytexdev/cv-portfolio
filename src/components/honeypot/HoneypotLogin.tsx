import styles from './HoneypotLogin.module.css'

type Props = {
  locked?: boolean
  variant?: 'generic' | 'wp'
}

export function HoneypotLogin({ locked = false, variant = 'generic' }: Props) {
  const title = variant === 'wp' ? 'WordPress Login' : 'Admin Login'

  return (
    <main className={styles.root}>
      <form className={styles.card} method="post" action="#">
        <h1 className={styles.title}>{title}</h1>
        {locked ? (
          <p className={styles.error}>Too many attempts. Try again later.</p>
        ) : (
          <p className={styles.error}>Invalid username or password.</p>
        )}
        <label className={styles.label}>
          Username
          <input className={styles.input} name="log" autoComplete="username" />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            name="pwd"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className={styles.button} disabled={locked}>
          Log In
        </button>
      </form>
    </main>
  )
}
