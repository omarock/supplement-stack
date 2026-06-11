# Audit pré-lancement — suppdoc.io

**Date :** 2026-06-11 · **Périmètre :** code source complet (white-box), dépendances, headers de production, architecture de scalabilité.
**Méthode :** revue white-box (3 audits parallèles : API/contrôle d'accès, auth/secrets/headers/XSS, Supabase/RLS) + `npm audit` + inspection des headers HTTP en production. **Aucune attaque active n'a été lancée contre la prod.**

---

## 1. Executive Summary

| Domaine | Score | Verdict |
|---|---|---|
| 🔐 Sécurité | **90 / 100** | Solide. 0 faille Critique/Haute. Quelques durcissements Moyens/Bas, 3 corrigés automatiquement. |
| ⚡ Performance | **92 / 100** | Très bon. PageSpeed mobile 96, SSG/CDN, LCP = texte SSR. |
| 📈 Scalabilité | **78 / 100** | Bonne base serverless. Plafond = pool de connexions Supabase + rate-limiter en mémoire (estimation architecturale, non mesurée). |
| **Préparation au lancement** | **🟢 GO (conditionnel)** | Lançable après **1 vérification manuelle obligatoire** : confirmer que la RLS est activée sur toutes les tables Supabase. |

**Le point unique bloquant avant lancement :** vérifier dans le dashboard Supabase que **Row Level Security est ON sur les 11 tables** (voir §4 et la checklist §9). Le code est sûr (tous les accès passent par la session vérifiée), mais la RLS est la seule barrière contre un accès **direct** à l'API REST Supabase avec la clé anon (qui est publique). Ça ne se vérifie pas depuis le code.

---

## 2. Ce qui est DÉJÀ bien fait (validé)

- **Pas d'IDOR.** Toutes les routes user (`track/*`, `bloodwork/*`, billing) dérivent l'identité de `supabase.auth.getUser()` (JWT vérifié serveur), jamais du corps de requête. Le client ne peut pas cibler les données d'un autre utilisateur.
- **Webhooks Stripe & Paddle** : signature HMAC-SHA256 vérifiée en temps constant (`timingSafeEqual`). Stripe avait déjà une fenêtre anti-rejeu ; **Paddle l'a maintenant aussi** (corrigé, §3).
- **Admin fail-closed** : si `ADMIN_EMAILS` n'est pas configuré, personne n'est admin. Routes admin gatées (403 sinon).
- **Crons** protégés par `CRON_SECRET` (fail-closed si absent).
- **Secrets** : aucun secret hardcodé, aucune clé service-role/serveur dans un composant `"use client"`, aucun `.env` commité (`.gitignore` couvre `.env*`).
- **Open redirect** : tous les `redirect`/`?redirect=` sont validés en chemin relatif same-origin (`startsWith("/") && !startsWith("//")`).
- **XSS** : les 24 `dangerouslySetInnerHTML` sont du JSON-LD ou du markdown admin **échappé** (`escapeHtml` + linkify `https?:` uniquement). Pas de DOM XSS (le `?s=` de /build est filtré contre `SUPPLEMENT_DB`).
- **Headers de prod (confirmés via curl)** : HSTS 2 ans + preload, CSP, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP. Couverture au-dessus de la moyenne.
- **Coûts LLM maîtrisés** : `/api/chat` = Claude réservé aux Premium (1 essai gratuit/IP) ; routes IA publiques rate-limitées (12–40/h/IP) ; pas de SSRF (bloodwork prend du base64, jamais une URL).

---

## 3. Vulnérabilités & correctifs

### ✅ Corrigés automatiquement (déployés)

| # | Gravité | Faille | Impact métier | Correctif |
|---|---|---|---|---|
| 1 | **Moyen** | `/api/lead` — aucun rate-limit (public, déclenche une écriture DB + un email fondateur à chaque appel) | DoS financier léger : flood d'emails au fondateur + consommation quota Resend + spam DB | `checkRateLimit('lead:'+ip, 8/h)` → 429 au-delà. `src/app/api/lead/route.ts` |
| 2 | **Moyen** | `/api/lead` — `note`/`source` injectés **non échappés** dans l'email HTML admin | Injection HTML/markup dans la boîte mail du fondateur | `escHtml()` sur email/source/note. `src/app/api/lead/route.ts` |
| 3 | **Bas** | Export CSV admin — injection de formule (cellule commençant par `= + - @`) | Exécution de formule à l'ouverture du CSV dans Excel/Sheets (emails de signup = données attaquant) | Préfixe `'` sur les cellules à risque. `src/app/admin/export/[type]/route.ts` |
| 4 | **Bas** | Webhook Paddle — pas de fenêtre anti-rejeu | Un webhook valide capturé pouvait être rejoué indéfiniment | Rejet hors fenêtre 5 min. `src/lib/paddle.ts` |

### ⚠️ Recommandés (non auto-corrigés — nécessitent une décision ou un service externe)

| # | Gravité | Faille | Pourquoi pas auto-corrigé | Action |
|---|---|---|---|---|
| 5 | **Moyen** | **RLS non vérifiable depuis le code** | Vit dans le dashboard Supabase | **OBLIGATOIRE avant lancement** — voir §4 + checklist |
| 6 | **Moyen** | CSP autorise `'unsafe-inline'` + `'unsafe-eval'` sur `script-src` | Migration vers CSP à nonce = risque de casser les scripts inline (theme-init, JSON-LD, Vercel/Paddle/GTM). À tester hors-prod. | Court terme : CSP à nonce via `proxy.ts` |
| 7 | **Bas** | Rate-limiter en mémoire (par instance) + `x-forwarded-for` spoofable | Nécessite Vercel KV / Upstash | Court terme : déplacer le store vers Upstash |
| 8 | **Bas** | `admin/agents` import = mass-assignment du `payload` ; publie en page publique `/library` | Admin-only ; le rendu markdown échappe déjà le HTML | Moyen terme : valider le schéma par `kind` |
| 9 | **Bas** | `/api/unsubscribe` sans token signé (désinscription de n'importe quel email) | Touche les templates d'emails | Moyen terme : HMAC du token de désinscription |
| 10 | **Bas** | anon peut INSERT des lignes à email usurpé dans `quiz_submissions`/`email_signups` (tracking client) | Choix de design (tracking anonyme) | Accepter, ou passer le tracking par une route serveur rate-limitée |

### 📦 Dépendances (`npm audit`)

- **2 vulnérabilités modérées** : `postcss < 8.5.10` (XSS via `</style>` dans la sortie CSS), **transitive via Next.js**. Le correctif `npm audit fix --force` **downgrade Next vers la 9.x = cassure majeure → NE PAS FAIRE**. Impact réel quasi nul ici (aucun CSS non-fiable traité au runtime). **Action :** attendre que Next embarque un postcss patché, puis `npm i next@latest` (16.2.9 dispo).
- Mises à jour mineures dispo (non urgentes) : `next 16.2.6→16.2.9`, `@supabase/supabase-js 2.106→2.108`, `react 19.2.4→19.2.7`. Recommandé en court terme (patchs).

---

## 4. Supabase / RLS — la vérification obligatoire

Le code accède aux données **toujours** via la session vérifiée (sûr). Mais la clé **anon est publique** (dans le bundle navigateur) : si une table n'a **pas** la RLS activée, elle est lisible/écrivable directement via `https://<ref>.supabase.co/rest/v1/<table>` **en contournant complètement l'app**.

**À exécuter dans le SQL Editor Supabase (lecture seule) :**

```sql
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
ORDER BY relname;
```

**`rls_enabled` doit être `true` pour les 11 tables :**
`quiz_submissions`, `link_clicks`, `email_signups`, `email_unsubscribes`, `stack_checkins`, `tracker_enrollments`, `bloodwork_reports`, `subscriptions`, `email_drip_log`, `agent_runs`, `agent_items`.

Si une table est à `false` → exécuter `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` puis les policies du dossier `supabase/*.sql`. **Tables PII les plus sensibles** (à vérifier en priorité) : `bloodwork_reports` (données de santé), `stack_checkins`, `subscriptions`, `quiz_submissions`.

> Aucun bucket Supabase Storage n'est utilisé (les PDF/images bloodwork sont parsés puis jetés, seul le JSON structuré est stocké) → rien à auditer côté Storage.

---

## 5. Tests d'intrusion (revue de surface d'attaque, white-box)

| Scénario | Résultat |
|---|---|
| **Anonyme → escalade de privilèges** | ❌ Impossible. Routes admin gatées `isAdminEmail(session)`, crons gatés `CRON_SECRET`. |
| **Anonyme → accès données privées** | ❌ via l'app (tout est session-scoped). ⚠️ via REST direct **si** une table n'a pas la RLS (→ §4). |
| **Anonyme → bypass auth** | ❌ Identité = `getUser()` (JWT vérifié), pas de mot de passe (magic-link + Google OAuth PKCE). |
| **Auth → IDOR horizontal** | ❌ Aucune route n'accepte un email/id d'un autre utilisateur depuis le body. |
| **Auth → escalade verticale** | ❌ Premium/admin dérivés de la DB/session, jamais du client. |
| **API → manipulation de params / fuzzing** | Inputs bornés (regex email, `clampScore`, caps de longueur, allowlists d'IDs). |
| **API → bypass de quota** | ⚠️ Partiel : le rate-limiter est en mémoire + IP spoofable (Bas, #7). Chemins coûteux (LLM) gatés Premium → exposition limitée. |
| **Webhooks → forge/rejeu** | ❌ Signature vérifiée + fenêtre anti-rejeu (Stripe & désormais Paddle). |

---

## 6. Performance

- **Frontend** (PageSpeed, mesuré sessions précédentes) : Mobile **96**, A11y **97**, Best-Practices **100**, SEO **100**. LCP = texte SSR, polices `next/font` (swap+preload), home statique. CLS/INP bons.
- **TTFB** : excellent — pages de contenu en SSG/ISR servies depuis le CDN edge Vercel (`X-Vercel-Cache: HIT` confirmé).
- **Backend** : routes API en `nodejs` serverless. Latence dominée par (a) l'aller-retour Supabase et (b) les appels LLM (chat/bloodwork/audit/generate). **Cold starts** ~100–300 ms sur instances froides (acceptable). Pas de N+1 évident ; les pages lourdes (catalogue) sont statiques.
- **Goulots identifiés** : appels LLM synchrones (10–20 s sur bloodwork) — déjà gérés en UI (états de chargement) ; aucun blocage serveur car réservés/limités.

---

## 7. Scalabilité (estimation architecturale — NON mesurée)

> ⚠️ **Aucun test de charge réel n'a été exécuté** (coûterait de l'argent sur la prod, risquerait des limites). Les états ci-dessous sont déduits de l'architecture, pas mesurés. Utiliser les scripts k6 fournis (§8) pour obtenir des chiffres réels.

| Utilisateurs simultanés | État | Facteur limitant |
|---|---|---|
| 100 | 🟢 OK | Rien — CDN + API légères |
| 500 | 🟢 OK | Rien de significatif |
| 1000 | 🟢 OK* | *si pooling Supabase activé |
| 5000 | 🟡 Conditionnel | **Pool de connexions Supabase** (Supavisor mode transaction) + rate-limiter en mémoire qui se fragmente au scale-out + rate limits Anthropic |
| 10000 | 🔴 Travaux requis | Pooling DB obligatoire + cache (déjà partiel via ISR) + rate-limiter KV + éventuelles read-replicas |

**Services limitants, par ordre :**
1. **Supabase** — connexions Postgres (le pooler PgBouncer/Supavisor est le vrai plafond ; dépend du plan). C'est le #1.
2. **Anthropic API** — rate limits + coût (mais chemins gatés Premium/limités).
3. **Rate-limiter en mémoire** — ne tient pas la charge multi-instances (sécurité, pas dispo).
4. **Vercel Functions** — autoscale bien ; rarement le plafond.

**Le contenu statique (home, fiches, /pricing, /build, /audit) scale quasi à l'infini** (CDN). Le risque de saturation se concentre sur les **routes API authentifiées qui touchent Supabase**.

---

## 8. Tests de charge — scripts k6 prêts à lancer

Fichiers créés dans `loadtest/` (voir `loadtest/README.md`). À lancer **depuis ta machine**, pas en prod aveugle :

```bash
# 1) installer k6 : https://k6.io/docs/get-started/installation/
# 2) charge normale (100 VUs)
k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io
# 3) montée 500/1000, stress 5000, spike : ajuster les stages dans le script
```

Les scripts ciblent **uniquement les pages publiques GET** (home, /pricing, /build, une fiche ingrédient) — **pas** les routes qui écrivent en DB / appellent le LLM, pour ne pas générer de coût ni de spam. Mesurent : RPS, latence moy., P95, P99, taux d'erreur.

---

## 9. Checklist de validation AVANT mise en production

**🔴 Bloquant**
- [ ] **RLS ON sur les 11 tables** (exécuter la requête §4 dans Supabase ; `bloodwork_reports`, `subscriptions`, `stack_checkins`, `quiz_submissions` en priorité).

**🟠 Fortement recommandé (court terme)**
- [ ] Confirmer en prod : `ADMIN_EMAILS`, `CRON_SECRET`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` sont bien définis (sinon fonctionnalités cassées/ouvertes).
- [ ] Activer le **pooling Supabase** (Supavisor, mode transaction) pour les routes serverless.
- [ ] Lancer les scripts k6 (§8) pour des chiffres réels à 100/500/1000 VUs.
- [ ] `npm i next@16.2.9 @supabase/supabase-js@latest react@latest react-dom@latest` (patchs).

**🟡 Moyen terme (post-lancement)**
- [ ] Migrer le rate-limiter vers Upstash/Vercel KV (garanties multi-instances).
- [ ] CSP à nonce (retirer `unsafe-inline`/`unsafe-eval`).
- [ ] Token HMAC sur les liens de désinscription.
- [ ] Validation de schéma sur `admin/agents` import.

**🟢 Long terme**
- [ ] Observabilité (Sentry/logs structurés) + alertes coût Anthropic/Resend.
- [ ] Tests d'endurance 24 h + read-replicas si trafic > 5000 simultanés.

---

## 10. Note finale de préparation au lancement

> ## 🟢 **GO — 90/100**, sous réserve de cocher l'unique point bloquant (RLS).

Le code est **mûr et sécurisé** : aucune faille critique, architecture saine, secrets propres, webhooks signés, headers complets. Les 4 correctifs sûrs sont déployés. **Le seul prérequis dur** est la vérification manuelle de la RLS Supabase (5 minutes, requête fournie). Les autres points sont du durcissement progressif, non bloquant pour un lancement.
