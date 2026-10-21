import type { CvDictionary } from '@/content/types'
import styles from './Footer.module.css'

type Props = {
  dictionary: CvDictionary
  imprintUrl?: string
  privacyUrl?: string
  sourceUrl?: string
  buildSha?: string
}

export function Footer({
  dictionary,
  imprintUrl,
  privacyUrl,
  sourceUrl,
  buildSha,
}: Props) {
  return (
    <footer className={styles.root}>
      <div className={`page-shell ${styles.inner}`}>
        <p className={`mono-label ${styles.tagline}`}>{dictionary.footer.tagline}</p>
        <ul className={styles.links}>
          {imprintUrl ? (
            <li>
              <a href={imprintUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.footer.imprint}
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            </li>
          ) : null}
          {privacyUrl ? (
            <li>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.footer.privacy}
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            </li>
          ) : null}
          {sourceUrl ? (
            <li>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.footer.source}
                <span className="visually-hidden"> {dictionary.externalNewTab}</span>
              </a>
            </li>
          ) : null}
        </ul>
        {buildSha ? <p className={`mono-label ${styles.build}`}>build {buildSha}</p> : null}
      </div>
    </footer>
  )
}
