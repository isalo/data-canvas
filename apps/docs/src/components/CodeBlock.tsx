export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="codeblock">
      <code>{children}</code>
    </pre>
  );
}
