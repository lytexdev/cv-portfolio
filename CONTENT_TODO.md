# Content TODO

Open `⟨AUSFÜLLEN⟩` / `⟨PRÜFEN⟩` items from the product brief. Do not invent values in the live site.

## Person

| Field | File | Notes |
|---|---|---|
| Verfügbarkeit / Availability | `src/content/de.ts` → `availability`, `src/content/en.ts` → `availability` | e.g. start date, remote/hybrid/on-site, region |

## Experience

| Field | File | Notes |
|---|---|---|
| LYTEX: öffentlich nennen? Coaching-Plattform | `src/content/de.ts` / `en.ts` → `experience.entries.freelance.highlights` | If yes, add highlight and include `fastapi`, `postgresql` in `src/content/shared.ts` freelance stack |
| QIKY: 2-3 konkrete Ergebnisse | `src/content/de.ts` / `en.ts` → `experience.entries.qiky.highlights` | Features, performance, migrations, team size |
| 8mylez: 2-3 konkrete Punkte | `src/content/de.ts` / `en.ts` → `experience.entries.apprenticeship.highlights` | Shopware plugins, client work, IHK result (Lockbox highlight already present) |

## Projects

| Field | File | Notes |
|---|---|---|
| kb-reifendienst: IT-Infrastruktur optional | featured highlights | Optional highlight about on-site IT |
| kb-reifendienst: Link freigeben? | `src/content/shared.ts` → `projects['kb-reifendienst'].href` | Verify live + client approval |
| camera-system: Telegram-Steuerbefehle? | featured highlights | Optional |
| rust-backup: Highlights | featured highlights | Compression, encryption, notable details |
| rust-backup: GitHub-Repo | `shared.ts` href | Optional |
| lytex-media: Stack | `shared.ts` stack | |
| lockbox: Stack | `shared.ts` stack | |
| secure-shredder: Verfahren + Stack | compact highlights + stack | Also verify SSD/TRIM/CoW documentation claim |
| metadata-cli: Formate + Stack | compact highlights + stack | |
| security-blog: Stack | `shared.ts` stack | |
| muffin-bot: weitere Stack-IDs | `shared.ts` stack | `discord` already set |
| med-tracker: Stack | `shared.ts` stack | |
| resilient-shop: Stack | `shared.ts` stack | |
