# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development server with hot-reload
npm run build    # Production build
npm run lint     # ESLint via next lint
npm start        # Run production build
```

No test framework is configured.

## Architecture

**Next.js 14 App Router SPA** — single route (`app/page.tsx`, ~1000 lines) with full client-side rendering (`'use client'`). Deployed to Vercel.

### State (`lib/store.ts`)

Single Zustand store (`useTeleprompterStore`) with two logical phases:

- **`appState: 'setup'`** — advisor fills `CRMData` (customer info, loan terms, lead type) and `CallData` before starting the call.
- **`appState: 'call'`** — 8-step guided call flow; `step` (1–8) drives which script content renders.

`tipoLead` (`'upper' | 'gancho' | 'expirado' | 'longtrack'`) is the main branching dimension — it changes which greeting, survey questions, and pitch variant are shown. Step 5 only appears for `longtrack` leads (CURP validation).

### Script generation (`lib/scripts.ts`)

Pure functions that accept `CRMData` and return interpolated Spanish-language strings. Each function maps to one call step. Adding or modifying script content means editing these functions — the UI in `page.tsx` calls them directly and renders the output.

### Data libraries (`lib/objeciones.ts`, `lib/faq.ts`)

Static arrays of typed objects rendered in the right-panel tools. `Objecion` uses the REA framework (`r/e/a` fields: Reconoce / Empatiza / Asegura). Extending the objection or FAQ database means adding entries to these arrays — no UI changes needed.

### UI structure (`app/page.tsx`)

Three-column layout in call mode:
1. **Left sidebar** — step navigation buttons, call timer, action buttons (copy audit note, CRM summary, end call)
2. **Center** — script blocks (indigo) and operational guides (amber) for the current step; form fields to capture call data in real time
3. **Right sidebar** — tabbed panel toggling between `objeciones` and `faq`

Custom CSS utility classes are defined in `app/globals.css` (`.script-block`, `.guia-operativa`, `.btn-primary`, `.input-standard`, etc.) — prefer these over inline Tailwind when they apply.

### Path alias

`@/*` resolves to the project root (configured in `tsconfig.json`). Use `@/lib/store`, `@/lib/scripts`, etc. for imports.
