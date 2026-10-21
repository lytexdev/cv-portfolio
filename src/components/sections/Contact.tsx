import { IconCalendar, IconMail, IconMapPin, IconPhone, IconPrinter } from '@tabler/icons-react'
import type { CvDictionary } from '@/content/types'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { Tooltip } from '@/components/interactive/Tooltip'
import { formatBirthDate } from '@/lib/dates'
import type { Locale } from '@/content/types'
import type { PrivateData } from '@/lib/server/private-data'
import type { Viewer } from '@/lib/server/viewer'
import styles from './Contact.module.css'

type Props = {
  locale: Locale
  dictionary: CvDictionary
  viewer: Viewer
  privateData: PrivateData | null
  tokenQuery?: string
  email: string
  city: string
  age: number | null
}

export function Contact({
  locale,
  dictionary,
  viewer,
  privateData,
  tokenQuery,
  email,
  city,
  age,
}: Props) {
  const section = dictionary.sections.contact
  const isToken = viewer.kind === 'token'
  const showPrivate = isToken && privateData
  const ageLabel = age !== null ? dictionary.contact.ageTooltip.replace('{n}', String(age)) : null

  return (
    <section id="contact" className="section" aria-labelledby="contact-title" data-reveal>
      <SectionHeading id="contact" rail={section.rail} title={section.title} />

      {viewer.kind === 'expired' ? (
        <p className={styles.banner}>{dictionary.contact.expiredHint}</p>
      ) : null}

      <div className={styles.grid}>
        <div>
          <a href={`mailto:${email}`} className={styles.email}>
            {email}
          </a>
          <div className={styles.actions}>
            <button type="button" className={styles.button} data-copy-email={email}>
              <IconMail size={18} stroke={1.75} aria-hidden="true" />
              {dictionary.contact.copyEmail}
            </button>
            <button type="button" className={styles.button} data-print-trigger>
              <IconPrinter size={18} stroke={1.75} aria-hidden="true" />
              {dictionary.contact.savePdf}
            </button>
            {isToken && tokenQuery ? (
              <a
                href={`/api/vcard?k=${encodeURIComponent(tokenQuery)}`}
                className={styles.linkButton}
              >
                {dictionary.contact.saveVcard}
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.details}>
          {showPrivate ? (
            <>
              <div className={styles.detailRow}>
                <IconPhone size={18} stroke={1.75} aria-hidden="true" />
                <div>
                  <p className={`mono-label ${styles.detailLabel}`}>{dictionary.contact.phone}</p>
                  <p className={styles.detailValue}>
                    <a href={`tel:${privateData.phone.replace(/\s+/g, '')}`}>{privateData.phone}</a>
                  </p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <IconMapPin size={18} stroke={1.75} aria-hidden="true" />
                <div>
                  <p className={`mono-label ${styles.detailLabel}`}>{dictionary.contact.address}</p>
                  <p className={styles.detailValue}>
                    {privateData.street}
                    <br />
                    {privateData.postalCode} {privateData.city}
                    <br />
                    {privateData.country}
                  </p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <IconCalendar size={18} stroke={1.75} aria-hidden="true" />
                <div>
                  <p className={`mono-label ${styles.detailLabel}`}>
                    {dictionary.contact.birthDate}
                  </p>
                  {ageLabel ? (
                    <Tooltip label={ageLabel}>
                      <p className={styles.detailValue} tabIndex={0}>
                        {formatBirthDate(privateData.birthDate, locale)}
                      </p>
                    </Tooltip>
                  ) : (
                    <p className={styles.detailValue}>
                      {formatBirthDate(privateData.birthDate, locale)}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.detailRow}>
                <IconMapPin size={18} stroke={1.75} aria-hidden="true" />
                <p className={styles.detailValue}>{city}</p>
              </div>
              <p className={styles.hint}>{dictionary.contact.publicHint}</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
