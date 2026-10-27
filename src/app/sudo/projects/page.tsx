import Link from 'next/link'
import { createCsrfToken } from '@/lib/server/csrf'
import { listDbProjects } from '@/lib/server/content-db'
import { projectImageSrc } from '@/lib/server/assets'
import {
  deleteProjectAction,
  ensureAdminOrRedirect,
  removeProjectImageAction,
  reorderProjectImagesAction,
  reorderProjectsAction,
  saveProjectAction,
  translateProjectAction,
  uploadProjectImageAction,
} from '../actions'
import { AdminNav } from '../_components/AdminNav'
import { TechIdReference } from '../_components/TechIdReference'
import { ConfirmForm } from '../_components/ConfirmForm'
import { ImageUploader } from '../_components/ImageUploader'
import { LocaleTabs } from '../_components/LocaleTabs'
import { SortableList } from '../_components/SortableList'
import styles from '../sudo.module.css'

type Props = {
  searchParams: Promise<{
    edited?: string
    saved?: string
    translated?: string
    uploaded?: string
    error?: string
    new?: string
  }>
}

export default async function ProjectsAdminPage({ searchParams }: Props) {
  const session = await ensureAdminOrRedirect()
  const csrf = await createCsrfToken(String(session.adminId))
  const projects = listDbProjects()
  const query = await searchParams
  const creating = query.new === '1'
  const editedSlug = query.edited || query.saved
  const editing = creating
    ? null
    : (projects.find((p) => p.slug === editedSlug) ?? projects[0] ?? null)

  return (
    <div className={styles.wrap}>
      <AdminNav />
      <div className={styles.buttonRow} style={{ marginBottom: '1rem' }}>
        <h1 className={styles.title} style={{ margin: 0, flex: 1 }}>
          Projects
        </h1>
        <Link className={styles.button} href="/sudo/projects?new=1">
          New project
        </Link>
      </div>

      {query.translated ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Translated to EN via DeepL.</p>
      ) : null}
      {query.uploaded ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Image uploaded and optimized.</p>
      ) : null}
      {query.saved ? (
        <p className={`${styles.flash} ${styles.flashOk}`}>Project saved.</p>
      ) : null}
      {query.error === 'upload' ? (
        <p className={`${styles.flash} ${styles.flashError}`}>Upload failed. Check file type and size.</p>
      ) : null}

      <div className={styles.split}>
        <aside className={styles.sideList}>
          <SortableList
            key={projects.map((p) => p.slug).join('|')}
            action={reorderProjectsAction}
            csrf={csrf}
            items={projects.map((p) => ({
              id: p.slug,
              label: p.title.de || p.slug,
              content: (
                <Link
                  href={`/sudo/projects?edited=${encodeURIComponent(p.slug)}`}
                  className={`${styles.sideItem} ${!creating && editing?.slug === p.slug ? styles.sideItemActive : ''}`}
                >
                  <span className={styles.sideItemTitle}>{p.title.de || p.slug}</span>
                  <span className={styles.muted}>
                    {p.slug} · {p.featured ? 'featured' : 'compact'}
                  </span>
                </Link>
              ),
            }))}
          />
        </aside>

        <div
          className={styles.editorPane}
          key={creating ? 'new' : (editing?.slug ?? 'empty')}
        >
          <h2 className={styles.title}>
            {editing ? `Edit · ${editing.slug}` : 'New project'}
          </h2>

          <form action={saveProjectAction} className={styles.grid}>
            <input type="hidden" name="csrf" value={csrf} />

            <p className={styles.sectionLabel}>Meta</p>
            <div className={styles.grid2}>
              <label className={styles.label}>
                Slug
                <input
                  className={styles.input}
                  name="slug"
                  required
                  defaultValue={editing?.slug ?? ''}
                  readOnly={Boolean(editing)}
                />
              </label>
              <label className={styles.label}>
                Layout
                <select
                  className={styles.select}
                  name="featured"
                  defaultValue={editing?.featured ? '1' : '0'}
                >
                  <option value="1">Featured</option>
                  <option value="0">Compact</option>
                </select>
              </label>
              <label className={styles.label}>
                External URL
                <input
                  className={styles.input}
                  name="href"
                  defaultValue={editing?.href ?? ''}
                  placeholder="https://"
                />
              </label>
              <label className={styles.label}>
                Stack IDs
                <input
                  className={styles.input}
                  name="stack"
                  defaultValue={editing?.stack.join(', ') ?? ''}
                  placeholder="nuxt, vue, docker"
                />
              </label>
            </div>

            <p className={styles.sectionLabel}>Copy</p>
            <LocaleTabs
              de={
                <>
                  <label className={styles.label}>
                    Title
                    <input
                      className={styles.input}
                      name="title_de"
                      defaultValue={editing?.title.de ?? ''}
                      required
                    />
                  </label>
                  <label className={styles.label}>
                    Kicker
                    <input
                      className={styles.input}
                      name="kicker_de"
                      defaultValue={editing?.kicker.de ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Summary (featured)
                    <textarea
                      className={styles.textarea}
                      name="summary_de"
                      defaultValue={editing?.summary.de ?? ''}
                      placeholder="Supports **bold**, *italic*, `code`, <icon-github>"
                    />
                  </label>
                  <label className={styles.label}>
                    One-liner (compact)
                    <input
                      className={styles.input}
                      name="one_liner_de"
                      defaultValue={editing?.oneLiner.de ?? ''}
                      placeholder="**Nuxt** site with <icon-docker>"
                    />
                  </label>
                  <label className={styles.label}>
                    Highlights (one per line; Markdown: **bold**, &lt;icon-github&gt;)
                    <textarea
                      className={styles.textarea}
                      name="highlights_de"
                      defaultValue={editing?.highlights.de.join('\n') ?? ''}
                    />
                  </label>
                </>
              }
              en={
                <>
                  <label className={styles.label}>
                    Title
                    <input
                      className={styles.input}
                      name="title_en"
                      defaultValue={editing?.title.en ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Kicker
                    <input
                      className={styles.input}
                      name="kicker_en"
                      defaultValue={editing?.kicker.en ?? ''}
                    />
                  </label>
                  <label className={styles.label}>
                    Summary (featured)
                    <textarea
                      className={styles.textarea}
                      name="summary_en"
                      defaultValue={editing?.summary.en ?? ''}
                      placeholder="Supports **bold**, *italic*, `code`, <icon-github>"
                    />
                  </label>
                  <label className={styles.label}>
                    One-liner (compact)
                    <input
                      className={styles.input}
                      name="one_liner_en"
                      defaultValue={editing?.oneLiner.en ?? ''}
                      placeholder="**Nuxt** site with <icon-docker>"
                    />
                  </label>
                  <label className={styles.label}>
                    Highlights (one per line; Markdown: **bold**, &lt;icon-github&gt;)
                    <textarea
                      className={styles.textarea}
                      name="highlights_en"
                      defaultValue={editing?.highlights.en.join('\n') ?? ''}
                    />
                  </label>
                </>
              }
            />

            <div className={styles.toolbar}>
              <button className={styles.button} type="submit">
                Save project
              </button>
            </div>
          </form>

          {editing ? (
            <form action={translateProjectAction} className={styles.toolbar}>
              <input type="hidden" name="csrf" value={csrf} />
              <input type="hidden" name="slug" value={editing.slug} />
              <button className={styles.buttonGhost} type="submit">
                Translate DE → EN
              </button>
            </form>
          ) : null}

          {editing ? (
            <>
              <p className={styles.sectionLabel}>Images</p>
              <p className={styles.muted}>
                Drag images or use the arrows to change the order. The first image is the cover.
              </p>
              {editing.images.length > 0 ? (
                <SortableList
                  key={editing.images.join('|')}
                  layout="grid"
                  action={reorderProjectImagesAction}
                  csrf={csrf}
                  fields={{ slug: editing.slug }}
                  items={editing.images.map((filename) => {
                    const src = projectImageSrc(editing.slug, filename)
                    return {
                      id: filename,
                      label: filename,
                      content: (
                        <article className={styles.imageCard}>
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" className={styles.imageThumb} draggable={false} />
                          ) : (
                            <div className={styles.imageThumb} />
                          )}
                          <div className={styles.imageMeta}>
                            <span className={styles.coverBadge}>Cover</span>
                            <code>{filename}</code>
                            <ConfirmForm
                              action={removeProjectImageAction}
                              title="Remove image?"
                              message={`Remove "${filename}" from this project? The file stays on disk.`}
                              confirmLabel="Remove"
                            >
                              <input type="hidden" name="csrf" value={csrf} />
                              <input type="hidden" name="slug" value={editing.slug} />
                              <input type="hidden" name="filename" value={filename} />
                              <button
                                className={`${styles.button} ${styles.buttonDanger}`}
                                type="submit"
                              >
                                Remove
                              </button>
                            </ConfirmForm>
                          </div>
                        </article>
                      ),
                    }
                  })}
                />
              ) : (
                <p className={styles.muted}>No images yet.</p>
              )}

              <ImageUploader
                action={uploadProjectImageAction}
                csrf={csrf}
                slug={editing.slug}
              />

              <div className={styles.toolbar}>
                <ConfirmForm
                  action={deleteProjectAction}
                  title="Delete project?"
                  message={`Delete "${editing.title.de || editing.slug}"? This cannot be undone.`}
                  confirmLabel="Delete project"
                >
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="slug" value={editing.slug} />
                  <button className={`${styles.button} ${styles.buttonDanger}`} type="submit">
                    Delete project
                  </button>
                </ConfirmForm>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <TechIdReference />
    </div>
  )
}
