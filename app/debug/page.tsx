'use client';

import { Button } from '@/components/ui/button';

export default function DebugPage() {
  return (
    <main className="from-background via-background to-muted/30 text-foreground min-h-screen space-y-8 bg-gradient-to-b p-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Debug Styles</h1>
        <p className="text-muted-foreground text-sm">
          Tailwind utilities, CSS variables, and shadcn/ui component tokens.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-card text-card-foreground shadow-card hover:shadow-card-hover rounded-xl border p-6 transition">
          <h3 className="mb-2 text-xl font-semibold">Tokens</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-muted text-foreground rounded-md px-3 py-1 shadow-sm">
              bg-muted
            </span>
            <span className="bg-primary text-primary-foreground rounded-md px-3 py-1 shadow-sm">
              bg-primary
            </span>
            <span className="bg-accent-500 rounded-md px-3 py-1 text-white shadow-sm">
              bg-accent-500
            </span>
            <span className="border-border rounded-md border px-3 py-1">
              border-border
            </span>
          </div>
        </div>

        <div className="bg-card text-card-foreground shadow-card rounded-xl border p-6">
          <h3 className="mb-2 text-xl font-semibold">Buttons</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-popover text-popover-foreground rounded-xl border p-6">
          <h3 className="mb-2 text-xl font-semibold">Progress</h3>
          <div className="space-y-2">
            <div className="bg-muted h-2 w-full rounded">
              <div className="bg-primary h-2 w-1/2 animate-pulse rounded" />
            </div>
            <p className="text-muted-foreground text-xs">
              Pulse animation shows utilities active.
            </p>
          </div>
        </div>

        <div className="from-primary/10 via-background to-primary/10 rounded-xl border bg-gradient-to-r p-6">
          <h3 className="mb-2 text-xl font-semibold">Shadows & Radius</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background h-16 rounded-md border shadow-sm" />
            <div className="bg-background h-16 rounded-lg border shadow-md" />
            <div className="bg-background h-16 rounded-xl border shadow-lg" />
            <div className="bg-background shadow-card h-16 rounded-2xl border" />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Dark mode</h2>
        <p className="text-muted-foreground text-sm">
          Toggle your theme control or set class "dark" on html to verify .dark
          variables.
        </p>
      </section>
    </main>
  );
}
