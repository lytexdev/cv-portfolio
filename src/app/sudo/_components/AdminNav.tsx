import Link from 'next/link'
import { logoutAction } from '../actions'
import styles from '../sudo.module.css'

export function AdminNav() {
  return (
    <nav className={styles.nav} aria-label="Admin">
      <Link href="/sudo">Dashboard</Link>
      <Link href="/sudo/tokens">Tokens</Link>
      <Link href="/sudo/projects">Projects</Link>
      <Link href="/sudo/experience">Experience</Link>
      <Link href="/sudo/stack">Stack</Link>
      <Link href="/sudo/footer">Footer</Link>
      <Link href="/sudo/content">Content</Link>
      <Link href="/sudo/logs">Logs</Link>
      <form action={logoutAction}>
        <button type="submit">Logout</button>
      </form>
    </nav>
  )
}
