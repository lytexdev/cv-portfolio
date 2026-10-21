# CV / Portfolio

Interactive CV and portfolio built with Next.js 16. Optional token gate, `/sudo` admin CMS, fish-style mini terminal (including AI `ask`), DE/EN i18n and Docker deployment.

## Features

- Token-gated or publicly readable CV (`CV_REQUIRE_TOKEN`)
- Private contact data only with a valid personal token
- Admin CMS at `/sudo` (tokens, projects, experience, content, stack, footer, logs)
- Command palette, theme toggle, mini terminal, print/PDF + vCard
- Optional DeepL (admin translate) and Mistral (`ask` in the terminal)
- No client-side third-party requests; CSP via `proxy.ts`
- `robots.txt` disallow all + `X-Robots-Tag: noindex`

## Requirements

- npm
- Node.js 24+
- Docker & Docker Compose (for production)

## Quick start

```bash
npm ci
cp data/private.example.json data/private.json
cp .env.example .env.production
# set SECRET_KEY and SECRET_ADMIN_PHRASE (long random values)
npm run fonts
npm run images
npm run dev
```

Open `http://localhost:3000/de`.

With `CV_REQUIRE_TOKEN=true` (default), missing `?k=` shows the token gate.  
With `CV_REQUIRE_TOKEN=false`, the CV is readable without a token; phone/address/birth date still need a valid token.

On first boot SQLite is created at `data/cv.sqlite`, content is seeded, and an initial admin is logged once:

```json
{"evt":"admin_bootstrap","username":"admin","temporaryPassword":"..."}
```

Log in at `/sudo`, change credentials, optionally enable TOTP.

Create a personal token:

```bash
npm run token -- create --label "Testo GmbH" --role "Frontend Developer" --base-url http://localhost:3000
```

```bash
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
| `LEGAL_*` | Imprint / privacy URLs |
| `DEEPL_API_KEY` | Optional DeepL Free (`:fx`) for DE→EN |
| `MISTRAL_AI_API_KEY` | Optional; powers terminal `ask` (server-side) |

**Never commit:** `.env`, `.env.production`, `data/private.json`, `data/cv.sqlite`, or `data/uploads/`.

## Access modes

| Mode | Env | Without `?k=` | With valid `?k=` |
| --- | --- | --- | --- |
| Gated (default) | `CV_REQUIRE_TOKEN=true` | Token gate | Full CV + private PII |
| Public | `CV_REQUIRE_TOKEN=false` | CV without private PII | CV + private PII |

Media and terminal `ask` follow the same rule: public mode allows unauthenticated reads/asks (rate-limited); gated mode requires a valid token (or admin session for media).

## Admin (`/sudo`)

- Login: username + password + `SECRET_ADMIN_PHRASE` + TOTP if enabled
- First login: mandatory credential change; TOTP optional
- Session cookie: httpOnly, Secure in production, SameSite=Strict, path `/`
- CRUD: tokens, projects, experience, content, stack, footer socials
- Image upload: magic-byte check → sharp → WebP → `data/uploads/`
- DeepL translate actions (server-side only)
- Audit log categories include `ai` for terminal asks

Honeypots (fake login, never real auth): `/admin`, `/wp-admin` — rate-limited, `honeypot_hit` logged.

## Terminal `ask`

```text
ask <question>
```

Server-side Mistral call with a compact public CV context (no phone/address/birth date). Rate-limited and audited under `/sudo/logs?category=ai`.

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
4. Permissions:

```bash
sudo chown -R 1000:1000 data
chmod 700 data
```

5. Start (external reverse proxy attaches to the container network; no host port publish in prod Compose):

```bash
BUILD_SHA=$(git rev-parse --short HEAD) docker compose up -d --build
```

Volume: `./data:/app/data:rw` (SQLite + uploads). Root filesystem stays `read_only: true`.

## Security notes

- Viewer pages stay cookieless; admin session cookie only after `/sudo` login
- Private contact data only with a valid token (`viewer.kind === 'token'`)
- No third-party client requests; DeepL and Mistral only from the server
- Site is noindex by default

## License

MIT - see [LICENSE](LICENSE).