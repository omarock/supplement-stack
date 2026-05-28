"use client";

import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import { validateInternalUrl, lookupSupplement } from "@/lib/knowledge-base";

/**
 * Tiny safe Markdown renderer for chat responses.
 *
 * Supported syntax (deliberately narrow — XSS surface stays small):
 *  - Paragraphs (separated by blank lines)
 *  - **bold**
 *  - *italic* and _italic_
 *  - `inline code`
 *  - [text](url) — internal links render as citation chips
 *  - Bullet lists ("- " or "* ")
 *  - Numbered lists ("1. ")
 *
 * Anything we don't understand is rendered as plain text. No raw HTML.
 */

interface Props {
  text: string;
  /** When true, citation chips show a smaller variant (used for streaming bubbles). */
  compact?: boolean;
}

export default function Markdown({ text, compact = false }: Props) {
  const blocks = parseBlocks(text);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map((b, i) => renderBlock(b, i, compact))}
    </div>
  );
}

// ─── Block parsing ────────────────────────────────────────────────────────
type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (line.trim() === "") { i++; continue; }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph — accumulate until blank line or list start
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }

  return blocks;
}

function renderBlock(block: Block, key: number, compact: boolean) {
  if (block.kind === "p") {
    return (
      <p key={key} style={{ margin: 0, lineHeight: 1.55, fontSize: 14.5, color: "inherit" }}>
        {renderInline(block.text, compact)}
      </p>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul key={key} style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ lineHeight: 1.55, fontSize: 14.5 }}>
            {renderInline(item, compact)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ol key={key} style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4 }}>
      {block.items.map((item, i) => (
        <li key={i} style={{ lineHeight: 1.55, fontSize: 14.5 }}>
          {renderInline(item, compact)}
        </li>
      ))}
    </ol>
  );
}

// ─── Inline parsing (bold / italic / code / links) ────────────────────────

interface InlineNode {
  kind: "text" | "bold" | "italic" | "code" | "link";
  text: string;
  href?: string;
}

function tokenizeInline(input: string): InlineNode[] {
  // Match in priority order:
  // 1) [text](url)
  // 2) **bold**
  // 3) `code`
  // 4) *italic* OR _italic_
  // The pattern is one big alternation with capture groups.
  const re = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)|(_([^_]+)_)/g;
  const nodes: InlineNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    if (m.index > lastIndex) {
      nodes.push({ kind: "text", text: input.slice(lastIndex, m.index) });
    }
    if (m[1]) {
      // [text](url)
      nodes.push({ kind: "link", text: m[2], href: m[3] });
    } else if (m[4]) {
      nodes.push({ kind: "bold", text: m[5] });
    } else if (m[6]) {
      nodes.push({ kind: "code", text: m[7] });
    } else if (m[8]) {
      nodes.push({ kind: "italic", text: m[9] });
    } else if (m[10]) {
      nodes.push({ kind: "italic", text: m[11] });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < input.length) {
    nodes.push({ kind: "text", text: input.slice(lastIndex) });
  }
  return nodes;
}

function renderInline(text: string, compact: boolean) {
  const nodes = tokenizeInline(text);
  return nodes.map((n, i) => {
    if (n.kind === "text") return <span key={i}>{n.text}</span>;
    if (n.kind === "bold") return <strong key={i} style={{ fontWeight: 600 }}>{n.text}</strong>;
    if (n.kind === "italic") return <em key={i} style={{ fontStyle: "italic" }}>{n.text}</em>;
    if (n.kind === "code") return (
      <code key={i} style={{
        fontFamily: FONTS.mono, fontSize: "0.88em",
        background: "rgba(10,37,64,0.06)",
        padding: "1px 5px", borderRadius: 5,
      }}>{n.text}</code>
    );
    // link
    if (n.href) {
      const internal = validateInternalUrl(n.href);
      if (internal) return <CitationChip key={i} text={n.text} href={n.href} type={internal.type} slug={internal.slug} compact={compact} />;
      // External or unrecognized internal — render as plain text (no link injection)
      return <span key={i}>{n.text}</span>;
    }
    return <span key={i}>{n.text}</span>;
  });
}

// ─── Citation chip ────────────────────────────────────────────────────────
function CitationChip({ text, href, type, slug, compact }: {
  text: string; href: string;
  type: "ingredient" | "stack" | "journal" | "build" | "quiz" | "audit" | "compare" | "research";
  slug?: string;
  compact: boolean;
}) {
  // For ingredient chips, enrich the label with a tiny preview tooltip via title attr
  const supp = type === "ingredient" || type === "research" ? lookupSupplement(slug ?? "") : undefined;
  const title = supp ? `${supp.name} — ${supp.purpose}` : text;

  const accent = type === "ingredient" || type === "research" ? TH.sageDeep
    : type === "stack" ? TH.amberDeep
    : type === "journal" ? TH.ink
    : TH.inkSoft;

  const Icon = type === "ingredient" || type === "research" ? <Pill /> : type === "stack" ? <Stack /> : <BookOpen />;

  return (
    <Link href={href} title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: compact ? "1px 8px 1px 4px" : "2px 10px 2px 5px",
      margin: "0 1px",
      background: `${accent}14`,
      color: accent,
      borderRadius: 999,
      fontWeight: 600,
      fontSize: compact ? "0.88em" : "0.92em",
      textDecoration: "none",
      verticalAlign: "baseline",
      lineHeight: 1.4,
      whiteSpace: "nowrap",
    }}>
      <span style={{ display: "inline-flex", flexShrink: 0 }}>{Icon}</span>
      {text}
    </Link>
  );
}

// ─── Inline icons ─────────────────────────────────────────────────────────
function Pill() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="M8.5 8.5l7 7" />
    </svg>
  );
}
function Stack() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l9 5-9 5-9-5 9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}
function BookOpen() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
    </svg>
  );
}
