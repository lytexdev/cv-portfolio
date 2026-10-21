# cv.lytex.dev

Interactive CV and portfolio for Immanuel Mruk. Token-gated Next.js app with `/sudo` admin CMS.

## Requirements

- Node.js 24+
- npm
- Docker and Docker Compose (for production-like runs)

## Local development

```bash
npm ci
cp data/private.example.json data/private.json
cp .env.example .env
# set SECRET_KEY and SECRET_ADMIN_PHRASE
npm run fonts
npm run images
npm run dev
```

Open `http://localhost:3000/de` — without `?k=` you get the token gate.

On first boot SQLite is created at `data/cv.sqlite`, content is seeded, and an initial admin is logged once:

```json
{"evt":"admin_bootstrap","username":"admin","temporaryPassword":"..."}
```

Log in at `/sudo`, change credentials, optionally enable TOTP.

Create a personal token:

```bash
npm run token -- create --label "Test GmbH" --role "Frontend Developer" --base-url http://localhost:3000
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
| `SECRET_KEY` | Session signing (≥16 chars) |
| `SECRET_ADMIN_PHRASE` | Extra admin login factor |
| `LEGAL_*` | Imprint / privacy URLs |
| `DEEPL_API_KEY` | Optional DeepL Free (`:fx`) for DE→EN |
| `MISTRAL_AI_API_KEY` | Optional; powers terminal `ask` (server-side) |

## Token gate

CV pages require a valid `?k=` token. Missing, invalid, revoked, or expired tokens show a gate UI with token input (expired includes a specific hint).

## Admin (`/sudo`)

- Login: username + password + `SECRET_ADMIN_PHRASE` + TOTP if enabled
- First login: mandatory credential change; TOTP optional
- Session cookie: httpOnly, Secure (prod), SameSite=Strict, path `/sudo` only
- CRUD: tokens, projects, experience, content strings
- Image upload: magic-byte check → sharp rotate/strip → WebP → `data/uploads/projects/<slug>/`
- DeepL translate actions (server-side only)

Honeypots (fake login, never real auth): `/admin`, `/wp-admin` — rate-limited, `honeypot_hit` logged.

## Error pages

- App: `/e/400` … `/e/504` (correct HTTP status)
- NPM custom pages: `public/errors/*.html` (502–504 and others)

## Docker (local)

```bash
cp .env.example .env
# PUBLIC_BASE_URL=http://127.0.0.1:3100
cp data/private.example.json data/private.json
BUILD_SHA=$(git rev-parse --short HEAD) docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

App: `http://127.0.0.1:3100/de`

```bash
docker compose run --rm tokenctl create --label "ACME GmbH" --role "Frontend Developer"
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

### Leak check

```bash
docker run --rm --entrypoint sh cv-lytex:latest -c 'grep -rl "CANARY_PRIVATE_PHONE" /app || true'
```

Expect no matches for private canaries. Runtime data lives only on the volume.

### Cloudflare / NPM

- DNS `cv` → server (DNS only at Cloudflare if desired)
- NPM: `cv.lytex.dev` → container `:3000`
- Custom error pages can point at `/errors/502.html` etc.

### Privacy note

The privacy policy should mention server logs and token view events.

## Security notes

- CV viewer pages stay cookieless; admin cookies only under `/sudo`
- Private contact data only with a valid token
- No third-party client requests; DeepL only from the server
