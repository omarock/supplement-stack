This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Content & SEO (programmatic pages)

All ingredient and goal pages are **generated automatically** from data files via
`generateStaticParams`. You never write a page by hand — add a data row and the
page (with metadata, JSON-LD, sitemap entry, and OG image) appears on the next build.

### Add a new ingredient → `/ingredients/[slug]`

Edit `src/lib/supplements.ts` and add an entry to `SUPPLEMENT_DB`. The `id` becomes
the slug (keep it lowercase + hyphenated). Required: `id, name, brand, dose, timing,
purpose, why, evidence, monthlyCost, hue, tags, vegan, iherbSearch`. Optional but
recommended for richer pages: `description` (2–3 paragraphs), `warnings`, `category`,
`priority`, and **`foodSources`** (string[], e.g. `["Salmon", "Walnuts"]` — drives the
"Natural food sources" section; the section is omitted if empty).

What auto-generates from one entry:
- The page at `/ingredients/<id>` + its `/research` subpage + per-page OG image
- Title/description/canonical/OpenGraph (`generateMetadata`)
- JSON-LD: `MedicalWebPage` + `DietarySupplement` + `BreadcrumbList`
- Sitemap entry (`src/app/sitemap.ts`)
- Cross-links from related ingredients / goals / interactions / biomarkers

**Citations** come from `src/lib/research.ts` (`RESEARCH[<id>]`). Add a `ResearchEntry`
with real `studies` (title, authors, journal, year, `pubmedQuery` or `pmid`) to power
the evidence subpage and the `citation` array in the ingredient JSON-LD. If there is no
entry, the citation block is omitted (never fabricated).

### Add a new goal → `/best/[goal]`

Edit `src/lib/goals.ts` and add a `Goal` to `GOALS` (`slug, label, h1, intro`, plus
`tags` **or** a curated `ids` list, optional `stackSlug`, and an `faq` array). The page
at `/best/<slug>` auto-generates with a ranked ingredient list, FAQ, and JSON-LD
(`MedicalWebPage` + `ItemList` + `FAQPage` + `BreadcrumbList`).

### Activate named medical review (E-E-A-T)

Add real clinicians to `REVIEWERS` in `src/lib/reviewers.ts`. The visible "Reviewed by"
byline and the `reviewedBy` structured data turn on automatically across every content
page. Until then, pages are honestly authored by the organisation (no fabricated names).

### Review date

Ingredient pages show a pinned `Last reviewed` date — bump the `LAST_REVIEWED` constant
in `src/app/ingredients/[slug]/page.tsx` when the catalog is re-reviewed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
