import { InternalHeader } from "@/components/chrome/InternalHeader";
import type { Role } from "@/generated/prisma/enums";

interface InternalLayoutProps {
  tool: string;
  role: Role;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}

// Shared shell for /cms, /ops, /support-console — previously each console
// duplicated this exact structure with bare content dropped straight
// into a max-w-5xl column: no card containment, no elevation, nothing
// to visually anchor a narrow form on a wide screen (content pinned to
// ~40% of the viewport with empty space on either side). The card here
// gives every console the same "floating panel" boundary the storefront
// already uses for every card of its own (border + bg-surface-raised,
// same radius token) instead of a visually distinct, undesigned surface.
export function InternalLayout({ tool, role, links, children }: InternalLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <InternalHeader tool={tool} role={role} links={links} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
