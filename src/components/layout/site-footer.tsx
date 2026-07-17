import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-sidebar">
      <div className="container-af py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-bold text-lg">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {siteConfig.tagline}
          </p>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3">Learn</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/problems" className="hover:text-primary">Problems</Link></li>
            <li><Link href="/patterns" className="hover:text-primary">Patterns</Link></li>
            <li><Link href="/roadmaps" className="hover:text-primary">Roadmaps</Link></li>
            <li><Link href="/blind-75" className="hover:text-primary">Blind 75</Link></li>
            <li><Link href="/grind-169" className="hover:text-primary">Grind 169</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3">Interview</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/companies" className="hover:text-primary">Companies</Link></li>
            <li><Link href="/interview-preparation" className="hover:text-primary">Interview prep</Link></li>
            <li><Link href="/system-design" className="hover:text-primary">System design</Link></li>
            <li><Link href="/glossary" className="hover:text-primary">Glossary</Link></li>
            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3">Product</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/about/attribution" className="hover:text-primary">Attribution</Link></li>
            <li><Link href="/sitemap-html" className="hover:text-primary">Sitemap</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-af py-4 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Educational use only.</p>
          <p>
            Solution code sourced under MIT from{" "}
            <a
              href={siteConfig.links.github}
              className="underline hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              kamyu104/LeetCode-Solutions
            </a>
            . Explanations are original AlgoForge content.
          </p>
        </div>
      </div>
    </footer>
  );
}
