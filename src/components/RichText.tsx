import { Fragment, type ReactNode, type CSSProperties } from "react";

// Renders a translated string with lightweight inline markup into React nodes:
//   **bold**  ->  <strong>
// Splitting on the markers (rather than hard-coding pre/bold/post fragments in
// JSX) lets each language place the emphasis wherever its grammar needs it, so
// translations stay natural. Currently only bold is supported; extend if needed.
export function richText(text: string, opts?: { boldStyle?: CSSProperties }): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={opts?.boldStyle}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}
