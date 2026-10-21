# cv.lytex.dev

Interactive CV and portfolio for Immanuel Mruk. Self-hosted Next.js app with personalized token links.

## Requirements

- Node.js 24+
- npm
- Docker and Docker Compose (for production-like runs)

## Local development

```bash
npm ci
cp data/private.example.json data/private.json
cp .env.example .env
npm run fonts
npm run images
npm run dev
```

Open `http://localhost:3000/de`.

Create a personal token:

```bash
npm run token -- add --label "Test GmbH" --role "Frontend Developer" --base-url http://localhost:3000
```

Other token commands:

```bash
npm run token -- list
npm run token -- revoke <id>
```

Quality gate:

```bash
npm run check
```

## Content placeholders

Open items from the brief live in [`CONTENT_TODO.md`](CONTENT_TODO.md). Do not invent missing content.

## Screenshots checklist (before `npm run images`)

Place originals in `assets/raw/` (gitignored). Generated WebPs in `public/` are committed.

- No hostnames, IPs, ports, usernames, tokens, or filesystem paths visible
- Nextcloud and Paperless-ngx only with demo data or redacted document titles
- Jellyfin only with own or public-domain media, or admin/dashboard views
- Person detection only with the owner or anonymized people
- Client project screenshots only with client approval

## Docker (local)

```bash
cp .env.example .env
# set PUBLIC_BASE_URL=http://127.0.0.1:3100 and any PROXY_NETWORK value
cp data/private.example.json data/private.json
BUILD_SHA=$(git rev-parse --short HEAD) docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

App: `http://127.0.0.1:3100/de`

Token CLI inside the image:

```bash
docker compose run --rm tokenctl add --label "ACME GmbH" --role "Frontend Developer"
docker compose run --rm tokenctl list
```

## Production deployment

1. Clone the repository on the server
2. Create `.env` from `.env.example`
   - `PUBLIC_BASE_URL=https://cv.lytex.dev`
   - `LEGAL_IMPRINT_URL` / `LEGAL_PRIVACY_URL` (required for footer links)
   - `PROXY_NETWORK` = Docker network name used by Nginx Proxy Manager (`docker network ls`)
3. Create `data/private.json` with real values (never commit):
   - phone, street, postalCode, city, country, birthDate
4. Permissions (tokenctl writes as UID 1000):

```bash
sudo chown -R 1000:1000 data
chmod 700 data
chmod 600 data/*.json
```

5. Build and start:

```bash
BUILD_SHA=$(git rev-parse --short HEAD) docker compose up -d --build
```

6. Leak check against the finished image:

```bash
docker run --rm --entrypoint sh cv-lytex:latest -c 'ls /app/data 2>&1; grep -rl "<phone-digits-without-spaces>" /app || true'
```

Expect: no `/app/data` directory in the image, and no matches for private values.

### Cloudflare

- A/AAAA record `cv` → server IP
- Proxy status: DNS only

### Nginx Proxy Manager

- Domain: `cv.lytex.dev` → `http://cv-lytex:3000`
- Block Common Exploits: on
- Websockets: off
- SSL: Let's Encrypt, Force SSL, HTTP/2
- Optional Advanced: `access_log off;` so token URLs are not written to NPM access logs

### Token workflow

```bash
docker compose run --rm tokenctl add --label "ACME GmbH" --role "Frontend Developer"
docker compose run --rm tokenctl list
docker compose run --rm tokenctl revoke <id>
```

Copy the printed link once into the application. Only hashes are stored in `data/tokens.json`.

### Privacy note

The linked privacy policy must mention server logs and token view events (which personalized link was opened when).

### Updates

```bash
git pull
BUILD_SHA=$(git rev-parse --short HEAD) docker compose up -d --build
```

## Security notes

- No cookies, no analytics, no third-party requests
- Private contact data only with a valid `?k=` token
- `data/` is mounted read-only at runtime and excluded from the image build
