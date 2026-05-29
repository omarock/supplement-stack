// One-shot migration runner: reads vercel env .env file, executes the
// email-drip SQL on Supabase via the REST API (using the service_role to
// invoke pg_meta when available, or falling back to per-statement creation).
const fs = require("fs");
const path = require("path");

const ENV_PATH = "C:/Users/X1/AppData/Local/Temp/.suppdoc.env";
const SQL_PATH = path.resolve(__dirname, "../supabase/email-drip-setup.sql");

function parseEnv(p) {
  const env = {};
  const txt = fs.readFileSync(p, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const m = /^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/.exec(line);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing supabase env vars");
    process.exit(1);
  }
  console.log("Supabase URL:", url);
  console.log("Service role key:", key.slice(0, 8) + "..." + key.slice(-6), `(${key.length} chars)`);

  // Step 1: Try a probe — does email_drip_log already exist?
  const probeRes = await fetch(`${url}/rest/v1/email_drip_log?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log("Probe email_drip_log:", probeRes.status, await probeRes.text().then(t => t.slice(0, 120)));

  // Step 2: Supabase exposes a SQL editor via the Management API. Let's also
  // try the legacy pg-meta path (often available on hosted projects).
  // We POST to: https://<ref>.supabase.co/pg/query (works if pg-meta is enabled)
  const sql = fs.readFileSync(SQL_PATH, "utf8");

  // Try the pg-meta path
  const pgMetaRes = await fetch(`${url.replace("/$", "")}/pg/query`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  console.log("pg-meta:", pgMetaRes.status, await pgMetaRes.text().then(t => t.slice(0, 200)));

  // Probe again
  const probe2 = await fetch(`${url}/rest/v1/email_drip_log?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log("Probe AFTER:", probe2.status, await probe2.text().then(t => t.slice(0, 120)));
}

main().catch(err => { console.error(err); process.exit(1); });
