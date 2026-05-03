# Duet — couples outfit planner

AI-styled outfits, planned together. Each partner uploads tops & bottoms; one button picks coordinated looks for both, with the partner's top color locked to match yours.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase: Auth, Postgres, Storage
- Azure OpenAI (Foundry) — GPT-4o vision via the `openai` SDK's `AzureOpenAI` client

## Setup

### 1. Install

```bash
pnpm install   # or npm i / yarn
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o          # your deployment name

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Your Azure deployment must support **vision** (e.g., `gpt-4o`).

### 3. Supabase schema

In the Supabase SQL editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql). It creates:

- `profiles`, `couples`, `garments`, `outfits` tables + RLS
- `garments` storage bucket + policies (folder layout `{user_id}/{type}/{uuid}.{ext}`)
- `join_couple(token)` RPC for partner pairing
- A trigger on `auth.users` that auto-creates a `profiles` row

### 4. Run

```bash
pnpm dev
```

## How it works

| Step | What happens |
|------|--------------|
| Sign up | Trigger creates a `profiles` row. |
| First dashboard load | A `couples` row is created with the user as `partner_a` and a random `invite_token`. |
| Invite | Share `/join/{token}`. Partner signs up/logs in and calls `join_couple` RPC, which sets `partner_b` and flips status to `active`. |
| Upload | Image → Supabase Storage (`garments/{user_id}/{type}/...`) → row in `garments` → `POST /api/analyze` calls Azure GPT-4o vision and fills `description`, `color_name`, `color_hex`, `color_family`, `seasons`, `formality`, `style_tags`, `complements`. |
| Randomize | `POST /api/randomize` — GPT picks your top+bottom; the partner pool is then filtered by hue distance to your top's hex (broader fallback if empty), and GPT picks the partner's coordinated look with your color locked. |
| Re-roll partner only | Same call with `mode: "partner_only"` — keeps your pick, excludes the previous partner pick. |
| Confirm | Inserts an `outfits` row with `confirmed: true`. Latest outfit appears on both partners' dashboards (RLS allows both members to read). |

## Deploy on Vercel

1. Push to GitHub.
2. Import the repo into Vercel.
3. Add the env vars above.
4. In Supabase: set the project's **Site URL** and **Additional Redirect URLs** to your Vercel domain so email confirmations land in the right place.

## Notes

- Color matching is broad: HSL hue distance with neutral handling, then GPT picks within the filtered pool.
- The "lock" prompt also tells GPT the locked color name + family, so even when fallback widens the pool the model still respects intent.
- Storage bucket is public-read for simplicity — switch to signed URLs if you want privacy from non-members.
