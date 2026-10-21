import type { CvDictionary } from '@/content/types'
import styles from './Footer.module.css'

type Props = {
  dictionary: CvDictionary
  imprintUrl?: string
  privacyUrl?: string
  version?: string
  buildSha?: string
}

export function Footer({
  dictionary,
  imprintUrl,
  privacyUrl,
  version,
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
        </ul>
        {(version || buildSha) && (
          <p className={`mono-label ${styles.build}`}>
            {version ? `v${version}` : null}
            {version && buildSha ? ' · ' : null}
            {buildSha ? `build ${buildSha}` : null}
          </p>
        )}
      </div>
    </footer>
  )
}
