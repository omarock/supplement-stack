/**
 * Tiny, safe Markdown to HTML for agent-written, human-approved article bodies.
 * Supports: ## / ### headings, - bullet lists, paragraphs, **bold**, *italic*,
 * [text](url) links, and bare URL auto-linking. Everything is HTML-escaped
 * first, so even though bodies are admin-approved we never inject raw markup.
 */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function inline(text: string): string {
  let t = escapeHtml(text);
  // [label](url) , url already escaped, allow http(s) and root-relative paths
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    (_m, label, href) => `<a href="${href}" style="color:#3f7a52;text-decoration:underline;">${label}</a>`);
  // bare urls not already inside an anchor
  t = t.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (_m, pre, url) =>
    `${pre}<a href="${url}" style="color:#3f7a52;text-decoration:underline;">${url}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return t;
}

export function renderMarkdown(md: string): string {
  const lines = String(md ?? "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => { if (para.length) { out.push(`<p style="margin:0 0 18px;font-size:17px;line-height:1.7;color:#3c4858;">${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list.length) { out.push(`<ul style="margin:0 0 18px;padding-left:22px;color:#3c4858;font-size:17px;line-height:1.7;">${list.map(li => `<li style="margin:0 0 6px;">${inline(li)}</li>`).join("")}</ul>`); list = []; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) { flushPara(); flushList(); out.push(`<h3 style="font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:600;font-size:21px;letter-spacing:-0.01em;margin:28px 0 10px;color:#0a2540;">${inline(line.replace(/^###\s+/, ""))}</h3>`); continue; }
    if (/^##\s+/.test(line)) { flushPara(); flushList(); out.push(`<h2 style="font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:600;font-size:27px;letter-spacing:-0.02em;margin:36px 0 14px;color:#0a2540;">${inline(line.replace(/^##\s+/, ""))}</h2>`); continue; }
    if (/^[-*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-*]\s+/, "")); continue; }
    if (line.trim() === "") { flushPara(); flushList(); continue; }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return out.join("\n");
}
