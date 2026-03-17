# Plan: saas-init Landing Page Site

**Target directory:** `~/projects/saas-init-site`
**Source copy:** `~/projects/saas-init/LANDING_PAGE.md`
**Validation:** `pnpm build` produces `out/` with no errors

---

## Stack

| Concern        | Choice                                 |
|----------------|----------------------------------------|
| Framework      | Next.js 15, App Router, static export |
| Styling        | Tailwind CSS v4                        |
| Components     | shadcn/ui (dark theme)                 |
| Icons          | Lucide React                           |
| Fonts          | Geist Sans + Geist Mono (next/font)    |
| Images         | None — icons, code, typography only    |
| Deployment     | Static (`output: 'export'`)            |

---

## Design System (apply globally)

- **Background:** `#09090b` (zinc-950)
- **Surface:** `#18181b` (zinc-900) for cards/sections
- **Border:** `#27272a` (zinc-800), 1px
- **Text primary:** `#fafafa` (zinc-50)
- **Text muted:** `#71717a` (zinc-500)
- **Accent:** `#a78bfa` (violet-400) for highlights, CTA hover
- **Terminal green:** `#4ade80` (green-400) for the `$` prompt
- **Section rhythm:** alternating `bg-zinc-950` / `bg-zinc-900`
- **Max content width:** `768px` centered, `px-6` on mobile

---

## Component Map

```
app/
  layout.tsx          ← root layout, metadata, fonts
  page.tsx            ← assembles all 8 sections
  globals.css         ← Tailwind v4 @theme, design tokens

components/
  sections/
    Hero.tsx          ← eyebrow, headline, subhead, TerminalWindow, trust badges
    Problem.tsx       ← 3-card problem/agitate layout
    ValueStack.tsx    ← 4-tier table + total vs price close
    SocialProof.tsx   ← 3 testimonial cards
    Transformation.tsx← 4-stage vertical timeline
    SecondaryCTA.tsx  ← avatar stack, question headline, CTA button
    Footer.tsx        ← logo, nav, social, legal

  ui/
    TerminalWindow.tsx ← reusable terminal chrome component
    Badge.tsx          ← small pill (via shadcn or custom)
    SectionWrapper.tsx ← consistent section padding + max-width
```

---

## Tasks

### Task 1 — Scaffold project and configure toolchain

- [x] Create Next.js 15 app at ~/projects/saas-init-site with TypeScript, Tailwind, App Router
- [x] Install shadcn/ui and Lucide React
- [x] Configure next.config.ts for static export
- [x] Configure dark mode and design tokens in globals.css
- [x] Validate: pnpm build exits 0, out/ directory exists

---

### Task 2 — Root layout, global styles, metadata

- [x] Wire Geist Sans + Geist Mono fonts via next/font
- [x] Set metadata (title, description, OpenGraph, Twitter)
- [x] Define design tokens in globals.css using Tailwind v4 @theme
- [x] Create SectionWrapper component
- [x] Validate: pnpm build exits 0

---

### Task 3 — Hero section + TerminalWindow component

- [x] Create TerminalWindow component with terminal chrome, prompt, and simulated output
- [x] Create Hero section with eyebrow, headline, subhead, CTA button, terminal, trust badges
- [x] Validate: pnpm build exits 0

---

### Task 4 — Problem, ValueStack, SocialProof sections

- [x] Create Problem section with 3 pain-point cards using Lucide icons
- [x] Create ValueStack section with 4 tier cards and price comparison
- [x] Create SocialProof section with 3 testimonial cards
- [x] Validate: pnpm build exits 0

---

### Task 5 — Transformation, SecondaryCTA, Footer sections

- [x] Create Transformation section with 4-stage vertical timeline
- [x] Create SecondaryCTA section with avatar stack and CTA button
- [x] Create Footer with logo, nav links, social icons, legal
- [x] Validate: pnpm build exits 0

---

### Task 6 — Assemble page.tsx and final build validation

- [ ] Wire all section components into app/page.tsx
- [ ] Verify: no img tags, no dynamic APIs, all external links have target="_blank"
- [ ] Verify: "use client" on components with useState, server components have no directive
- [ ] Verify: next.config.ts has output: 'export' and images: { unoptimized: true }
- [ ] Validate: pnpm build exits 0, out/index.html exists

---

## Non-Goals

- No analytics, no tracking scripts
- No contact form or email capture (pure static)
- No dark/light toggle — always dark
- No animations beyond CSS transitions
- No external image CDN or stock assets
- No i18n

---

## Reference

- Copy source: `~/projects/saas-init/LANDING_PAGE.md`
- GitHub: https://github.com/oleg-koval/saas-init
- Twitter: https://twitter.com/saas_init (@saas_init)
- Next.js static export docs: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Tailwind v4 docs: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
