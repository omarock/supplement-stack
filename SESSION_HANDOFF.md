# SuppDoc.io — Passation de session (2026-06-12) — « Pré-lancement : sécurité, Product Hunt, polish »

À coller dans une nouvelle session pour reprendre avec tout le contexte. (Dans ce projet, `MEMORY.md` se charge aussi automatiquement.)

## 0. Identité & directives permanentes (ne jamais redemander)
- **Omar Fakir**, Casablanca, fondateur non-technique, répond en **français**, sensible aux coûts API, veut le travail fait **POUR** lui, premium, sans jargon.
- **suppdoc.io** : compléments evidence-based. Revenus = affiliation **iHerb (DII6469)** + **Amazon (suppdoc07-20)**. Pas de marque maison.
- Stack : Next.js 16.2.6 modifié (Turbopack, lire `node_modules/next/dist/docs/` avant d'écrire du Next), React 19, TS, Supabase, Vercel. Styles inline + tokens `TH` (`src/lib/theme.ts`). Repo : `…\AI Supplement Stack Generator\supplement-stack`.
- **Déploiement** = commit + push master (Vercel auto ~2-4 min). Fichiers src en LF.
- **Règles dures** : pas de « AI » visible, **pas de tirets longs (—)**, YMYL (rien d'inventé, pas de faux avis/stats), commits finissent par `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **🔴 DIRECTIVES** : Omar reste **ANONYME** (jamais demander sameAs/FOUNDER, restent vides). Paiement = **Stripe via LLC** (PAS Lemon Squeezy/Paddle ; Stripe câblé pour quand FOUNDING_MODE=false).
- **Préférence design** : il déteste les petits **« eyebrows » en capitales au-dessus des titres** (« YOUR STACK », style AI/template) → retirés partout, **ne jamais en remettre** (garder les labels fonctionnels/sécurité).

## 1. État actuel
- **HEAD master = `d70cd66`**, tout déployé et vérifié live.
- Sécurité **96/100**, RLS vérifiée OK, perf PageSpeed mobile 96. **🟢 GO pour le lancement.**

## 2. Fait cette session (commits master, par thème)
- **Hero premium** (dégradé teal→vert signature) sur **/me, /track, /plan** (`a9e4a06`, `98174a2`). Onglet « Today » du hub /me rendu réel (localStorage + reset quotidien + célébration), label Insights honnête (`42bbc9b`).
- **SEO/indexation** (`c9d16a9`) : GSC = **25 indexées (↑ de 7)**, 550 « détectées non indexées » = budget crawl domaine jeune (PAS un bug ; sitemap 714 URLs OK ; tunnel indexé). **Bug réel corrigé** : erreurs « product snippet » (DietarySupplement) sur TOUTES les fiches ingrédients → retiré les 2 nœuds Produit, gardé `Substance` + citations. Vérifié live (GSC test). Indexation demandée pour ashwagandha + creatine.
- **UX profil** (`744cc43`) : lien « ← My Stack » sur /track + /plan ; « Manage plan » fusionné dans Account de /me ; bouton « Open tracker » attractif ; boutons iHerb/Amazon de /plan améliorés ; menu mobile = compte en premier.
- **Mobile** (`c046515`) : audit 375px (tout clean, 0 débordement) ; liens footer 21→33px.
- **Audit sécurité** (`6b785b2`) : 0 faille crit/haute. 4 fixes (rate-limit + échappement HTML sur /api/lead, injection formule CSV export admin, anti-rejeu webhook Paddle). Rapport = `SECURITY_AUDIT.md`, scripts charge k6 = `loadtest/`.
- **RLS vérifiée** (dashboard Supabase) : ON sur les 11 tables, 13 policies = propriétaire-only, **aucune fuite**. Projet ref `ihbourjkfjufdenzrypm`, org « AI Supplement », **plan Free/NANO, AWS eu-west-1**.
- **Rate-limiter durci** (`ddb89ae`) : IP non-spoofable (`x-real-ip`) ; `checkRateLimit` async + **Upstash** (activé si env `UPSTASH_REDIS_REST_URL`/`_TOKEN`, sinon fallback mémoire).
- **CSP** (`6c89076`) : `unsafe-eval` retiré de la prod (dev-only). `unsafe-inline` reste (obligatoire Next App Router ; le retirer casserait le cache CDN).
- **Home raccourcie** (`016dee7`) : 12 → 9 sections (retiré Stats isolée, SocialProof/témoignages, Ingredients faible ; gardé StrongestEvidence + « Built to be trusted »).
- **Eyebrows retirés** (`12442f7` + `184716d`) : ~20 pages, kickers décoratifs au-dessus des titres. **Gardés** : labels fonctionnels/sécurité (« When to see a doctor », « TL;DR », badges, stat labels).
- **Modale /build** (`d70cd66`) : retiré les 2 boutons « Open all » (bloqués par popups, multi-onglets `window.open`) + note + eyebrow ; gardé la liste par-produit (1 tap = 1 onglet). ⚠️ « Je vois encore les boutons » = **cache navigateur** (hard refresh) ; le fix est live.

## 3. 🚀 PRODUCT HUNT — programmé (le gros morceau)
- **Lancement CRÉÉ et PROGRAMMÉ sur le compte PH d'Omar** (connecté dans Chrome) pour **mercredi 17 juin 2026, 12:01 AM PDT (08:01 Casablanca)**.
- Rempli : nom « suppdoc.io », tagline « Free, evidence-based supplement stack builder & checker », description complète, 3 tags (Health & Fitness · Quantified Self · Productivity), thumbnail (logo capsule auto), **1 image galerie** (og-image), **commentaire maker** (se poste AUTO au lancement), Omar Fakir solo maker, Pricing = Paid-with-free-version.
- **Lien pré-lancement à partager** (collecte de followers) : `https://www.producthunt.com/products/suppdoc-io`
- Thread de discussion pré-lancement publié sur PH (répondre aux commentaires).
- **⚠️ RESTE À FAIRE (à la main d'Omar)** : ajouter **3-4 images galerie** via Edit launch → Images and media (glisser ses propres captures propres : home hero, hub /me, /stacks, /audit). Captures headless ont échoué + outil d'upload sandboxé.
- Kits prêts dans `growth/` (hors repo) : `product-hunt-launch.md`, messages supporters, posts LinkedIn/X. Logo PH dans `growth/product-hunt-assets/`.
- **Règle PH** : jamais « vote pour moi » en public (ban) ; partage privé « jette un œil ».

## 4. ⏳ Tâches ouvertes / prochaines actions
- **Ajouter les images galerie PH** (Omar) + relire le lancement.
- **17 juin** : exécuter l'outreach supporters (privé), répondre aux commentaires PH, poster LinkedIn/X.
- **Marketing trafic réel US** (à sa main, kits prêts) : commentaires Reddit de valeur (compte EvidenceOverHype ; Reddit **bloqué pour l'agent** via l'outil), Quora long-tail, Pinterest infographies. NE PAS mettre de liens dans r/Supplements (brûle le compte).
- **Fiverr gig trafic** (Linda) : acheté ; lancer **après le 17 juin**, pointer sur l'**accueil**, source **Pinterest**, surveiller clics affiliés. (Trafic social non ciblé, ne convertira pas — vanity metric.)
- **Garder /compare + data report** (assets SEO/backlinks, surtout le data report pour débloquer l'indexation). Option : renforcer le data report.
- **Recommandé non fait** : provisionner **Upstash** (env vars) pour le rate-limiter distribué ; **Supabase Pro $25/mo + pooler Supavisor** avant de scaler (Free pause + limite) ; patchs npm (`next@16.2.9`, supabase, react). Infra ~45-80 $/mo pour 10k users/1k simultanés.
- Optionnel : retirer aussi les labels « TL;DR/THE SHORT ANSWER » (garder ceux de sécurité) ; brancher l'« Amazon add-all-to-cart » (non fait, couverture ASIN partielle : 139 produits).

## 5. ⚙️ Gotchas techniques
- **Cache navigateur** après déploiement : changements client (modale, JS) → **hard refresh** côté user. Les clés i18n (ex « openAllIherb ») restent dans le dictionnaire même si le composant ne les rend plus → ne pas se fier au grep du HTML pour vérifier un déploiement ; vérifier un texte **non-i18n** retiré.
- **`.next` corrompu** après serveur dev preview → `rm -rf .next` avant tsc/build. Stopper la preview avant build.
- **Screenshots Claude Preview TIMEOUT** sur pages à grille (/results, /me, /products) → vérifier via `preview_eval` (DOM). Pages légères OK.
- **Pages auth** (/me, /track, /plan) non prévisualisables → route de test temporaire publique sous `src/app/<nom>-preview/` (PAS `_nom`, underscore = 404), puis SUPPRIMER avant commit.
- **Frappe navigateur (Chrome MCP)** saute des caractères → préférer `form_input` (remplissage direct) ; mais ça ne déclenche pas toujours React (champs contrôlés) → taper au clavier dans ce cas.
- **Reddit bloqué** par l'outil navigateur (« site not allowed »).
- **Mobile QA** : `preview_resize` preset mobile = vrai 375×812.
- **Commits PowerShell** : message via fichier `..\_commitmsg.txt` (outil Write) + `git commit -F`, puis supprimer (BOM).

## 6. 🧠 Mémoire & accès
Index dans `…\.claude\projects\…\memory\MEMORY.md`. Fichiers clés ajoutés cette session : `project_premium_hero.md`, `project_seo_indexation.md`, `project_security_audit.md`, `feedback_no_eyebrow_kickers.md`. **Claude in Chrome connecté** : GSC, Vercel, **Supabase**, **Product Hunt** (tous connectés et authentifiés).

**Prochaine action recommandée** : aider Omar à finaliser les **images galerie Product Hunt** + préparer le jour J (17 juin).
