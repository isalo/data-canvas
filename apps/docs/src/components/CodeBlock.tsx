import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";

export type CodeLang = BundledLanguage | "text";

const SUPPORTED_LANGS: BundledLanguage[] = ["ts", "tsx", "js", "jsx", "json", "bash", "sql"];

const LANG_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  bash: "Shell",
  sql: "SQL",
  text: "Text",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-dimmed"],
      langs: SUPPORTED_LANGS,
    });
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  children: string;
  lang?: CodeLang;
  filename?: string;
}

export async function CodeBlock({ children, lang = "ts", filename }: CodeBlockProps) {
  const code = children.replace(/\n$/, "");
  const resolvedLang: CodeLang = (SUPPORTED_LANGS as readonly string[]).includes(lang) ? lang : "text";

  let html: string;
  if (resolvedLang === "text") {
    html = `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  } else {
    const highlighter = await getHighlighter();
    html = highlighter.codeToHtml(code, {
      lang: resolvedLang as BundledLanguage,
      theme: "github-dark-dimmed",
    });
  }

  return (
    <figure className="codeblock">
      <figcaption className="codeblock-bar">
        <span className="codeblock-lang">{LANG_LABELS[resolvedLang] ?? resolvedLang}</span>
        {filename ? <span className="codeblock-filename">{filename}</span> : null}
      </figcaption>
      <div className="codeblock-body" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
