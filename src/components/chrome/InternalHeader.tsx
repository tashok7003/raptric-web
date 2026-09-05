import Link from "next/link";

// Chrome, "internal" variant — 10e: tool name + role, nothing else. No
// marketing nav, no cart, no footer columns; internal tools are a
// different chrome variant, not the storefront header with items hidden.
export function InternalHeader({
  tool,
  role,
  links,
}: {
  tool: string;
  role: string;
  links: { href: string; label: string }[];
}) {
  return (
    <header className="border-b border-[var(--color-border)] bg-chrome px-4 py-3 text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6">
        <span className="font-display text-[15px] font-bold">RAPTRIC · {tool}</span>
        <nav className="flex items-center gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-chrome-muted hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto rounded-[999px] border border-chrome text-chrome-muted px-2 py-0.5 text-[11px]">
          {role}
        </span>
      </div>
    </header>
  );
}
