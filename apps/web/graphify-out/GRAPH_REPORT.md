# Graph Report - web  (2026-08-16)

## Corpus Check
- 54 files · ~10,747 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 472 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- compilerOptions
- dependencies
- server.ts
- Button.tsx
- createClient
- devDependencies
- CampaignsTable.tsx
- WhatsappPanel.tsx
- [id]/actions.ts
- NewListDialog.tsx
- getActiveOrg
- CaptureJobsTable.tsx
- app/layout.tsx
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 51 edges
2. `getActiveOrg()` - 22 edges
3. `compilerOptions` - 16 edges
4. `Button()` - 13 edges
5. `Modal()` - 11 edges
6. `sourceLabel()` - 9 edges
7. `clsx()` - 7 edges
8. `include` - 7 edges
9. `scripts` - 5 edges
10. `criarCampanha()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `CampaignsPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/campaigns/page.tsx → src/lib/supabase/server.ts
- `CapturePage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/capture/page.tsx → src/lib/supabase/server.ts
- `excluirSequencia()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/sequences/actions.ts → src/lib/supabase/server.ts
- `WhatsappPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/whatsapp/page.tsx → src/lib/supabase/server.ts
- `login()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(auth)/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 1 - "dependencies"
Cohesion: 0.07
Nodes (26): @meulead/db, @meulead/shared, next, dependencies, @meulead/db, @meulead/shared, next, papaparse (+18 more)

### Community 2 - "server.ts"
Cohesion: 0.14
Nodes (11): ActionState, login(), signup(), traduzErro(), Action, ActionState, AuthForm(), SUPABASE_ANON_KEY (+3 more)

### Community 3 - "Button.tsx"
Cohesion: 0.15
Nodes (17): ActionResult, adicionarPasso(), criarSequencia(), excluirPasso(), excluirSequencia(), AdicionarPassoDialog(), Passo, PassosEditor() (+9 more)

### Community 4 - "createClient"
Cohesion: 0.19
Nodes (16): ActionResult, criarFunilPadrao(), criarNegocio(), excluirNegocio(), moverNegocio(), CrmPage(), DashboardPage(), Home() (+8 more)

### Community 5 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 6 - "CampaignsTable.tsx"
Cohesion: 0.16
Nodes (15): ActionResult, criarCampanha(), dispararCampanha(), excluirCampanha(), TODO: acionar webhook do n8n para começar a processar os alvos., CampaignsPage(), CampaignForm(), Lista (+7 more)

### Community 7 - "WhatsappPanel.tsx"
Cohesion: 0.16
Nodes (15): ActionResult, conectarSessao(), criarSessao(), desconectarSessao(), excluirSessao(), WhatsappPage(), Conversa, ConversasSection() (+7 more)

### Community 8 - "[id]/actions.ts"
Cohesion: 0.21
Nodes (13): ActionResult, addLead(), deleteLead(), importLeads(), LeadInput, ListDetailPage(), AddLeadDialog(), ImportCsvDialog() (+5 more)

### Community 9 - "NewListDialog.tsx"
Cohesion: 0.28
Nodes (8): ActionResult, createList(), deleteList(), ListsPage(), DeleteListButton(), NewListDialog(), SOURCE_LABELS, SOURCE_OPTIONS

### Community 10 - "getActiveOrg"
Cohesion: 0.26
Nodes (8): logout(), ActionResult, criarJob(), DashboardLayout(), CaptureForm(), ORIGEM_OPTIONS, ActiveOrg, getActiveOrg()

### Community 11 - "CaptureJobsTable.tsx"
Cohesion: 0.31
Nodes (6): CapturePage(), CaptureJob, CaptureJobsTable(), formatDate(), STATUS_LABELS, STATUS_STYLES

### Community 12 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **91 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `server.ts`, `Button.tsx`, `CampaignsTable.tsx`, `WhatsappPanel.tsx`, `[id]/actions.ts`, `NewListDialog.tsx`, `getActiveOrg`, `CaptureJobsTable.tsx`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `getActiveOrg()` connect `getActiveOrg` to `Button.tsx`, `createClient`, `CampaignsTable.tsx`, `WhatsappPanel.tsx`, `[id]/actions.ts`, `NewListDialog.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._