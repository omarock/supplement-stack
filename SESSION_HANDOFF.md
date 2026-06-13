# suppdoc.io — Passation de session (2026-06-13)

À coller dans une nouvelle session pour reprendre avec tout le contexte. (Dans ce projet, `MEMORY.md` se charge aussi automatiquement.)

## 0. Identité & directives permanentes (ne jamais redemander)
- **Omar Fakir**, Casablanca, fondateur non-technique. Répond en **français**, sensible aux coûts API, veut le travail fait POUR lui, premium, sans jargon.
- **suppdoc.io** : compléments evidence-based. Revenus = affiliation iHerb (DII6469) + Amazon (suppdoc07-20). **Pas de marque maison.**
- Stack : Next.js **16.2.9** modifié (Turbopack — lire `node_modules/next/dist/docs/` avant d'écrire du Next), React 19.2.7, TS, Supabase, Vercel. Styles inline + tokens `TH` (`src/lib/theme.ts`). Repo : `…\AI Supplement Stack Generator\supplement-stack`.
- Déploiement = **commit + push master** (Vercel auto, build ~7 min pour 1000+ pages). Fichiers src en LF. Commits finissent par `Co-Authored-By: Claude …`.
- 🔴 **DIRECTIVES** : Omar reste ANONYME (jamais demander sameAs/FOUNDER). Paiement = Stripe via LLC. YMYL (rien d'inventé, pas de faux avis/stats). **Pas de « AI » visible. Pas de tirets longs. Casse normale partout, JAMAIS de label en capitales-mono au-dessus d'un titre** (le « tell IA » qu'il déteste).

## 1. 🚀 LANCEMENT — le gros sujet
- **Product Hunt programmé : mercredi 17 juin 2026, 12:01 AM PDT (08:01 Casablanca).** Page complète (6 images galerie, tagline, description, commentaire maker auto, tags, thread pré-lancement). Lien pré-lancement : https://www.producthunt.com/products/suppdoc-io
- **On est en CODE FREEZE jusqu'au lancement** : que des changements sûrs et vérifiés.
- ⏳ **La SEULE vraie tâche qui reste à Omar** : réunir **8-12 supporters** à prévenir le jour J (messages prêts dans `growth/product-hunt-launch.md` : « save the date », « we're live », posts LinkedIn/X). Facteur n°1 du classement. Jamais « vote pour moi » en public.

## 2. État actuel
- **HEAD master = `fcf2a6d`**, tout déployé et vérifié live. Sécurité 96/100, perf 96, RLS OK. 🟢 GO.
- Untracked sans impact : `scripts/make-marketing-cards.mjs` (ignorer).

## 3. Fait cette session (2026-06-13)
- **Emails GSC réglés** : « noindex » = page research dong-quai (garde anti-thin-content volontaire) ; « product snippet » = vieux crawls creatine/ashwagandha, validation relancée. Indexées : 29.
- **Deps patchées** (`dfc5d60`) : next 16.2.9, react 19.2.7, supabase-js 2.108.1. `@supabase/ssr` laissé à 0.10.3 exprès.
- **Data report renforcé** (`3626646`) : meta dynamique, 71 776 études en avant, Finding « interaction hubs ».
- **Tell IA retiré en masse** : labels TL;DR (`9579363`), eyebrows dynamiques (`4131516`), **refonte premium fiche ingrédient ×200** (`7dddbc4` : badges casse-normale + indicateur de preuve, quick-answer/why-it-matters/quick-facts/avoid-if + cartes produit premium), **polissage home** (`543e50d`), **sweep pages publiques batch 1** (`f740bfd` : quiz/audit/stacks/EvidenceBadge/pricing/CTA), **fix dict** `recommended` 4 langues (`7e76a2b`).
- **Section home « Built to be trusted » supprimée** (`d4fe113`).
- **Audit + nettoyage sûr** (`479f4b2`) : supprimé Navbar.tsx + SocialProof.tsx (orphelins) + dép lucide-react. Rapport : `CLEANUP_AUDIT.md`.
- **Trafic Fiverr (Linda) démasqué = bots** (analytics Vercel = 8 vrais visiteurs, firewall = datacenters) → **dispute Fiverr gagnée, remboursé 61,53 $**.
- **Design system premium livré** (`fcf2a6d`, `DESIGN_SYSTEM.md`) via le skill `ui-ux-pro-max` : direction couleur/typo/composants/UX-confiance + guide d'écriture premium. + maquettes home premium montrées (approuvées, **parkées** — voir mémoire `project_home_redesign_concept`).

## 4. Tâches ouvertes (après le 17, sauf mention)
- **AVANT mercredi** : Omar contacte ses supporters + (optionnel, ma main) cleanup **batch 2** du tell IA sur pages auth (`/me /track /plan /bloodwork`) + `/build` (labels mono encore présents — voir `feedback_no_eyebrow_kickers.md`, dont valeurs UPPERCASE du dict : signinEyebrow, signupEyebrow, almostReady, orTemplate, yourStack, forYou).
- **Refonte premium de la home** (parkée, approuvée) : construire avec les vrais comptes de niveaux de preuve depuis `SUPPLEMENT_DB`. Recette dans `project_home_redesign_concept` (mémoire) + `DESIGN_SYSTEM.md`.
- **Refactoring profond** (reporté, `CLEANUP_AUDIT.md`) : ~60 exports/types morts (knip), découpage gros composants, typage. Après lancement.
- **Décisions infra** (optionnel) : Supabase Pro 25 $/mo (pic inscriptions jour J), Upstash gratuit (à créer par Omar), brancher `lib/indexnow.ts` (codé mais pas câblé).
- **Marketing à la main d'Omar** : Reddit (compte EvidenceOverHype, outil bloqué pour moi), Quora, Pinterest. NE PAS relancer de gig « trafic » (bots).

## 5. ⚙️ Gotchas techniques (importants)
- **PowerShell `-match` est INSENSIBLE à la casse** → `'>BESTSELLER<'` matche `>Bestseller<`. Pour vérifier qu'un label MAJUSCULE a disparu : `[regex]::Matches($html,[regex]::Escape('TEXTE')).Count` (sensible) ou `-cmatch`.
- **Vérif déploiement** : toujours `-Headers @{'Cache-Control'='no-cache'}` (le CDN sert du stale → faux « pas déployé »). Le build finit souvent **juste après** une boucle de 7 min.
- **Certains tells sont dans le dict i18n** (`src/messages/{en,fr,de,es}.json`), pas le CSS → changer la valeur dans les 4 langues. Les valeurs retirées **restent** dans le payload i18n du HTML (faux positifs grep) → grepper un marqueur visible.
- **Capture preview** : `preview_screenshot` TIMEOUT sur pages à grille (fiche ingrédient, /results) → vérifier via `preview_eval`. Home/quiz OK.
- **`.next` corrompu** si on le supprime pendant que la preview tourne → **stopper la preview AVANT** `rm .next`/build.
- **Maquettes** : `show_widget` impose un style sobre → pour du premium suppdoc, coder les vrais dégradés/ombres/couleurs inline.
- Accès live : **Claude in Chrome connecté** (GSC, Vercel, Supabase, Product Hunt, Fiverr). Reddit bloqué par l'outil.
- **Python pas installé** (stub Windows Store) ; le skill `ui-ux-pro-max` a été exploité en lisant ses CSV (`…\.claude\skills\ui-ux-pro-max\data\`).

## 6. 🧠 Mémoire
Index : `…\.claude\projects\…\memory\MEMORY.md`. Mis à jour cette session : `feedback_no_eyebrow_kickers.md` (règle élargie + dict trap), `project_prelaunch_maintenance.md`, `project_seo_indexation.md`, `project_home_redesign_concept.md` (nouveau, parké). Docs repo : `CLEANUP_AUDIT.md`, `DESIGN_SYSTEM.md`.

**Prochaine action recommandée : aider Omar à finaliser sa liste de supporters Product Hunt pour mercredi.**
