# Graph Report - web  (2026-08-31)

## Corpus Check
- 104 files · ~147,251 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 542 nodes · 1153 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d583a9de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- dependencies
- (auth)/actions.ts
- CampaignForm.tsx
- oportunidades/page.tsx
- devDependencies
- campaigns/actions.ts
- WhatsappPanel.tsx
- getActiveOrg
- sourceLabel
- createClient
- creditos/actions.ts
- app/layout.tsx
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- lp/page.tsx
- DescubraForm.tsx
- StatusView.tsx
- cnpj.ts
- privacidade/page.tsx
- termos/page.tsx

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 70 edges
2. `getActiveOrg` - 46 edges
3. `compilerOptions` - 16 edges
4. `enriquecerDonos()` - 14 edges
5. `sourceLabel()` - 13 edges
6. `CreditosPage()` - 11 edges
7. `Button()` - 11 edges
8. `isAdmin()` - 11 edges
9. `clsx()` - 11 edges
10. `formatarPreco()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `OportunidadesPage()` --calls--> `getActiveOrg`  [EXTRACTED]
  src/app/dashboard/oportunidades/page.tsx → src/lib/org.ts
- `WhatsappPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/whatsapp/page.tsx → src/lib/supabase/server.ts
- `Home()` --calls--> `createClient()`  [EXTRACTED]
  src/app/page.tsx → src/lib/supabase/server.ts
- `login()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(auth)/actions.ts → src/lib/supabase/server.ts
- `signup()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(auth)/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (29 total, 6 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 1 - "dependencies"
Cohesion: 0.10
Nodes (21): lucide-react, @meulead/db, @meulead/shared, next, dependencies, lucide-react, @meulead/db, @meulead/shared (+13 more)

### Community 2 - "(auth)/actions.ts"
Cohesion: 0.10
Nodes (17): ActionState, login(), logout(), normalizaWhatsapp(), signup(), traduzErro(), Action, ActionState (+9 more)

### Community 3 - "CampaignForm.tsx"
Cohesion: 0.08
Nodes (28): criarCampanha(), addLead(), importLeads(), LeadInput, AddLeadDialog(), CampaignForm(), Lista, ModeCard() (+20 more)

### Community 4 - "oportunidades/page.tsx"
Cohesion: 0.19
Nodes (15): Conteudo(), OportunidadesPage(), DashboardPage(), Filtro, formatarTelefone(), ListaOption, OportunidadeRow, OportunidadesView() (+7 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+20 more)

### Community 6 - "campaigns/actions.ts"
Cohesion: 0.21
Nodes (13): ActionResult, AUTO_DEFAULTS, dispararCampanha(), enviarFollowup(), excluirCampanha(), CampaignsTable(), Campanha, Metricas (+5 more)

### Community 7 - "WhatsappPanel.tsx"
Cohesion: 0.12
Nodes (28): ActionResult, checarConexao(), ConectarResult, conectarSessao(), criarSessao(), desconectarSessao(), excluirSessao(), instanciaDaSessao() (+20 more)

### Community 8 - "getActiveOrg"
Cohesion: 0.11
Nodes (28): CrmPage(), analisarSiteLead(), enviarParaCrm(), removerSemWhatsapp(), soDigitos(), validarWhatsapp(), LeadsPage(), ActionResult (+20 more)

### Community 9 - "sourceLabel"
Cohesion: 0.12
Nodes (21): ActionResult, createList(), deleteList(), ListsPage(), CaptureJob, CaptureJobsTable(), formatDate(), STATUS_LABELS (+13 more)

### Community 10 - "createClient"
Cohesion: 0.07
Nodes (63): CampaignsPage(), ActionResult, criarJob(), JobInput, CapturePage(), Coluna, COLUNAS_VALIDAS, moverLeadStatus() (+55 more)

### Community 11 - "creditos/actions.ts"
Cohesion: 0.07
Nodes (41): POST(), abrirPortalAssinatura(), ActionResult, CheckoutResult, iniciarCheckoutRecarga(), recarregarManual(), recarregarUsuario(), CreditosPage() (+33 more)

### Community 12 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 20 - "lp/page.tsx"
Cohesion: 0.09
Nodes (29): iniciarCheckoutAssinatura(), Ciclo, LpPlanos(), FAQ, GALERIA, jakarta, metadata, NICHOS (+21 more)

### Community 21 - "DescubraForm.tsx"
Cohesion: 0.18
Nodes (13): ActionResult, salvarInteressado(), DescubraForm(), Etapa, metadata, BASE_NACIONAL, estimarQuantidade(), humanizar() (+5 more)

### Community 22 - "StatusView.tsx"
Cohesion: 0.16
Nodes (15): AdsCell(), BADGE, CampanhaOption, Coluna, COLUNAS, formatarTelefone(), hrefUrl(), LeadDetail() (+7 more)

### Community 23 - "cnpj.ts"
Cohesion: 0.36
Nodes (6): buscarDonoPorNome(), DonoEncontrado, semAcento(), STOP, titulo(), tokens()

## Knowledge Gaps
- **151 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `(auth)/actions.ts`, `CampaignForm.tsx`, `oportunidades/page.tsx`, `campaigns/actions.ts`, `WhatsappPanel.tsx`, `getActiveOrg`, `sourceLabel`, `creditos/actions.ts`, `DescubraForm.tsx`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `getActiveOrg` connect `getActiveOrg` to `CampaignForm.tsx`, `oportunidades/page.tsx`, `campaigns/actions.ts`, `WhatsappPanel.tsx`, `sourceLabel`, `createClient`, `creditos/actions.ts`, `lp/page.tsx`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `salvarInteressado()` connect `DescubraForm.tsx` to `createClient`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `securityHeaders`, `nextConfig` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `(auth)/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._