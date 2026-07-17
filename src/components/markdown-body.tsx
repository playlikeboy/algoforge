export function MarkdownBody({ html }: { html: string }) {
  return (
    <div
      className="prose-af"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
