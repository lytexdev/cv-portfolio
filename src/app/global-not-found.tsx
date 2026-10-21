import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { jetbrainsMono, montserrat } from '@/lib/fonts'
import '@/styles/globals.css'
import styles from './global-not-found.module.css'

export const metadata: Metadata = {
  title: '404 · Immanuel Mruk',
  robots: {
    index: false,
    follow: false,
  },
}

const themeInitScript = `(function(){try{var t=localStorage.getItem('cv-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}document.documentElement.classList.add('js');if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-reduced-motion','true')}else{document.documentElement.setAttribute('data-reduced-motion','false')}})();`

export default async function GlobalNotFound() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const pathHint = 'unknown'

  return (
    <html
      lang="de"
      data-theme="dark"
      className={`${montserrat.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <main className={styles.root}>
          <p className={`mono-label ${styles.prompt}`}>immanuel@lytex ~&gt;</p>
          <h1 className={styles.title}>
            fish: Unknown command: <span className={styles.path}>{pathHint}</span>
          </h1>
          <p className={styles.subtitle}>Seite nicht gefunden · Page not found</p>
          <Link href="/de" className={styles.back}>
            Zurück zum Lebenslauf · Back to the CV
          </Link>
        </main>
      </body>
    </html>
  )
}
