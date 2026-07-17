import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/config";

const nav = [
  { href: "/problems", label: "Problems" },
  { href: "/topics", label: "Topics" },
  { href: "/patterns", label: "Patterns" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/blind-75", label: "Blind 75" },
  { href: "/companies", label: "Companies" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-af flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-black">
              AF
            </span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40 transition-colors"
          >
            <span>Search…</span>
            <kbd className="rounded border border-border bg-muted px-1.5 text-[10px] font-mono">/</kbd>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Progress
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
