"use client";

import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

export function MarkdownBody({ html }: { html: string }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [html]);

  return (
    <div
      className="prose-af"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
