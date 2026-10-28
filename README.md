# CV / Portfolio

Interactive CV and portfolio built with Next.js 16. Optional token gate, `/sudo` admin CMS, fish-style mini terminal, DE/EN i18n and Docker deployment.

## Features

- Token-gated or publicly readable CV (`CV_REQUIRE_TOKEN`)
- Optional search indexing (`INDEX_PUBLIC`)
- Private contact data only with a valid personal token
- Admin CMS at `/sudo` (tokens, projects, experience, content, stack, footer, logs)
- Lightweight Markdown in CMS text (`**bold**`, `*italic*`, `` `code` ``, `<icon-github>`)
- Command palette, theme toggle, mini terminal, print/PDF + vCard
- Optional DeepL (admin translate)
- No client-side third-party requests; CSP via `proxy.ts`

## Requirements

- npm
- Node.js 24+
- Docker & Docker Compose (for production)

## Quick start

```bash
npm ci
cp data/private.example.json data/private.json
cp .env.example .env
# set SECRET_KEY and SECRET_ADMIN_PHRASE (long random values)
npm run fonts
npm run images
npm run dev
```

Open `http://localhost:3000/de`.

With `CV_REQUIRE_TOKEN=true` (default), missing `?k=` shows the token gate.  
With `CV_REQUIRE_TOKEN=false`, the CV is readable without a token; phone/address/birth date still need a valid token.

On first boot SQLite is created at `data/cv.sqlite`, content is seeded, and an initial admin is created:

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `admin124` |

Log in at `/sudo` with those credentials plus `SECRET_ADMIN_PHRASE`. The first login forces a password change (username change optional). TOTP is optional.

### Create access tokens

**Preferred: Admin UI** — open `/sudo/tokens`, create/revoke tokens in the browser (label, role, expiry). No CLI required.

**Optional CLI** (useful for scripts/Docker):

```bash
npm run token -- create --label "Testo GmbH" --role "Frontend Developer" --base-url http://localhost:3000
npm run token -- list
npm run token -- revoke <id>
```

Quality gate:

```bash
npm run check
```

## Environment

See [`.env.example`](.env.example). Local uses `.env`; production Compose uses `.env.production` (gitignored).

| Variable | Purpose |
| --- | --- |
| `PUBLIC_BASE_URL` | Canonical site URL |
| `PORT` | Listen port (Compose maps host port locally) |
| `VERSION` | Shown in footer |
| `SECRET_KEY` | Session / crypto signing (≥16 chars) |
| `SECRET_ADMIN_PHRASE` | Extra admin login factor |
| `CV_REQUIRE_TOKEN` | `true` = gate without `?k=`; `false` = public CV (default `true`) |
| `INDEX_PUBLIC` | `true` = allow indexing; `false` = noindex everywhere (default `false`) |
| `LEGAL_*` | Imprint / privacy URLs |
| `DEEPL_API_KEY` | Optional DeepL Free (`:fx`) for DE→EN |

**Never commit:** `.env`, `.env.production`, `data/private.json`, `data/cv.sqlite`, or `data/uploads/`.

## Access modes

| Mode | Env | Without `?k=` | With valid `?k=` |
| --- | --- | --- | --- |
| Gated (default) | `CV_REQUIRE_TOKEN=true` | Token gate | Full CV + private PII |
| Public | `CV_REQUIRE_TOKEN=false` | CV without private PII | CV + private PII |

Media follows the same rule: public mode allows unauthenticated reads; gated mode requires a valid token (or admin session for media).

### Search indexing

| `INDEX_PUBLIC` | Behavior |
| --- | --- |
| `false` (default) | `robots.txt` disallow all; `X-Robots-Tag` / meta noindex |
| `true` | Public CV pages may be indexed; `/sudo`, `/admin`, `/api`, `/media` stay noindex |

## Admin (`/sudo`)

- Login: `admin` / `admin124` (bootstrap) + `SECRET_ADMIN_PHRASE` + TOTP if enabled
- First login: mandatory password change; username change optional
- Session cookie: httpOnly, Secure in production, SameSite=Strict, path `/`
- CRUD: **tokens** (create/revoke in UI), projects, experience, content, stack, spoken languages, footer socials
- Text fields support `**bold**`, `*italic*`, `` `code` ``, line breaks via `<br>`, and stack icons via `<icon-github>` (any tech id from the stack registry)
- Image upload: magic-byte check → sharp → WebP → `data/uploads/`
- Documents for experience entries (certificates, references) and projects (documentation, reports): PDF, JPEG, PNG or WebP up to 9 MB, detected by content, not by extension
  - Images are re-encoded to WebP without EXIF, GPS or XMP
  - PDFs are rebuilt with `pdf-lib`: form fields flattened, then Info dictionary, XMP, JavaScript, actions, annotations, attachments and form structures removed, EXIF/XMP stripped from embedded JPEG scans
  - Encrypted or password-protected PDFs are rejected
  - Stored as `data/uploads/documents/<uuid>` with mode `0600`; deleting an experience entry or project removes its files
  - Served from `/media/documents/<uuid>` only to valid tokens or an admin session, also in public mode, with a strict CSP and `no-store`; every view and download is audited
- DeepL translate actions (server-side only)

Honeypots (fake login, never real auth): `/admin`, `/wp-admin` — rate-limited, `honeypot_hit` logged.

## Docker (local)

```bash
cp .env.example .env
# PUBLIC_BASE_URL=http://127.0.0.1:3100
cp data/private.example.json data/private.json
BUILD_SHA=$(git rev-parse --short HEAD) docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

App: `http://127.0.0.1:3100/de`

```bash
docker compose run --rm tokenctl create --label "Testo GmbH" --role "Frontend Developer"
docker compose run --rm tokenctl list
```

## Production deployment

1. Clone on the server
2. Create `.env.production` from `.env.example` (never commit)
3. Create `data/private.json` (never commit)
4. Complete the forced credential change on first `/sudo` login
5. Permissions:

```bash
sudo chown -R 1000:1000 data
chmod 700 data
```

6. Start (external reverse proxy attaches to the container network; no host port publish in prod Compose):

```bash
BUILD_SHA=$(git rev-parse --short HEAD) docker compose up -d --build
```

Volume: `./data:/app/data:rw` (SQLite + uploads). Root filesystem stays `read_only: true`.

## Security notes

- Viewer pages stay cookieless; admin session cookie only after `/sudo` login
- Private contact data only with a valid token (`viewer.kind === 'token'`)
- No third-party client requests; DeepL only from the server
- Site is noindex unless `INDEX_PUBLIC=true`

## License

MIT - see [LICENSE](LICENSE).
