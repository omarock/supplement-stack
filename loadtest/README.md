# Load testing — suppdoc.io

Real load-test numbers (RPS / P95 / P99 / error rate) must be **measured**, not
guessed. This folder has a ready-to-run [k6](https://k6.io) script. Run it from
your own machine.

## Install k6
- macOS: `brew install k6`
- Windows: `winget install k6 --source winget` (or `choco install k6`)
- Linux/docs: https://k6.io/docs/get-started/installation/

## Run

```bash
# Normal load (~100 concurrent users), against production:
k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io --env SCENARIO=normal

# Higher load (ramps 500 → 1000):
k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io --env SCENARIO=high

# Stress (ramps to 5000 — finds the breaking point):
k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io --env SCENARIO=stress

# Spike (sudden burst):
k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io --env SCENARIO=spike
```

## ⚠️ Safety rules
- The script hits **only public, cacheable GET pages** (home, /pricing, /build,
  /audit, /stacks, ingredient pages). It deliberately does **NOT** call:
  - any route that writes to Supabase (`/api/track/*`, `/api/lead`, …),
  - any route that sends email (`/api/lead`, crons),
  - any route that calls the LLM (`/api/chat`, `/api/bloodwork/analyze`,
    `/api/generate-stack`, `/api/audit-stack`).
  Hammering those would cost money (Anthropic, Resend) and spam your DB/inbox.
- Start with `normal`, read the results, then escalate. Don't jump to `stress`
  first.
- A 24h endurance test = run `normal` with a long `target` duration; only do this
  on a staging deployment to avoid skewing production analytics.

## What to read in the output
- `http_reqs` rate ≈ **RPS**.
- `http_req_duration` → **avg / p(95) / p(99)** latency.
- `http_req_failed` → **error rate** (threshold set to <2%).
- `ttfb_ms` (custom) → server time-to-first-byte trend.

## Interpreting results
- Static pages should hold thousands of RPS from the Vercel CDN with low error
  rate — if they don't, it's a CDN/config issue, not your app.
- The real ceiling is the **authenticated API + Supabase**. To load-test those
  safely you need a **staging Supabase project** + seeded test users + auth
  tokens; never run write/LLM load against production.
