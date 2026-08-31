# Graph Report - web  (2026-08-31)

## Corpus Check
- 104 files · ~148,299 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 549 nodes · 1172 edges · 34 communities (25 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `08727d11`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- dependencies
- (auth)/actions.ts
- [id]/page.tsx
- oportunidades/page.tsx
- devDependencies
- createClient
- WhatsappPanel.tsx
- getActiveOrg
- SegmentoBusca.tsx
- captura.ts
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
- package.json
- scripts
- @meulead/db
- papaparse
- @types/node

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 71 edges
2. `getActiveOrg` - 46 edges
3. `compilerOptions` - 16 edges
4. `enriquecerDonos()` - 14 edges
5. `sincronizarJobs()` - 13 edges
6. `sourceLabel()` - 13 edges
7. `CreditosPage()` - 11 edges
8. `Button()` - 11 edges
9. `isAdmin()` - 11 edges
10. `iniciarRun()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `CrmPage()` --calls--> `getActiveOrg`  [EXTRACTED]
  src/app/dashboard/crm/page.tsx → src/lib/org.ts
- `OportunidadesPage()` --calls--> `getActiveOrg`  [EXTRACTED]
  src/app/dashboard/oportunidades/page.tsx → src/lib/org.ts
- `WhatsappPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/dashboard/whatsapp/page.tsx → src/lib/supabase/server.ts
- `Home()` --calls--> `createClient()`  [EXTRACTED]
  src/app/page.tsx → src/lib/supabase/server.ts
- `adsPendentes()` --calls--> `createClient()`  [EXTRACTED]
  src/lib/captura.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (34 total, 9 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 1 - "dependencies"
Cohesion: 0.12
Nodes (17): lucide-react, @meulead/shared, next, dependencies, lucide-react, @meulead/shared, next, react (+9 more)

### Community 2 - "(auth)/actions.ts"
Cohesion: 0.10
Nodes (17): ActionState, login(), logout(), normalizaWhatsapp(), signup(), traduzErro(), Action, ActionState (+9 more)

### Community 3 - "[id]/page.tsx"
Cohesion: 0.07
Nodes (39): recarregarManual(), ActionResult, addLead(), deleteLead(), importLeads(), LeadInput, ListDetailPage(), DashboardPage() (+31 more)

### Community 4 - "oportunidades/page.tsx"
Cohesion: 0.21
Nodes (14): Conteudo(), OportunidadesPage(), Filtro, formatarTelefone(), ListaOption, OportunidadeRow, OportunidadesView(), temSite() (+6 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/papaparse (+9 more)

### Community 6 - "createClient"
Cohesion: 0.10
Nodes (31): ActionResult, AUTO_DEFAULTS, criarCampanha(), dispararCampanha(), enviarFollowup(), excluirCampanha(), CampaignsPage(), Coluna (+23 more)

### Community 7 - "WhatsappPanel.tsx"
Cohesion: 0.13
Nodes (27): ActionResult, checarConexao(), ConectarResult, conectarSessao(), criarSessao(), desconectarSessao(), excluirSessao(), instanciaDaSessao() (+19 more)

### Community 8 - "getActiveOrg"
Cohesion: 0.08
Nodes (37): CapturePage(), analisarSiteLead(), enviarParaCrm(), removerSemWhatsapp(), soDigitos(), validarWhatsapp(), LeadsContent(), LeadsPage() (+29 more)

### Community 9 - "SegmentoBusca.tsx"
Cohesion: 0.47
Nodes (4): bonito(), SegmentoBusca(), Cnae, CNAES

### Community 10 - "captura.ts"
Cohesion: 0.07
Nodes (55): ActionResult, criarJob(), criarJobInstagram(), JobInput, casa(), dominio(), iniciarAdsGoogle(), iniciarAdsMeta() (+47 more)

### Community 11 - "creditos/actions.ts"
Cohesion: 0.08
Nodes (38): POST(), abrirPortalAssinatura(), ActionResult, CheckoutResult, iniciarCheckoutRecarga(), recarregarUsuario(), CreditosPage(), fmt() (+30 more)

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
Cohesion: 0.20
Nodes (12): salvarInteressado(), DescubraForm(), Etapa, metadata, BASE_NACIONAL, estimarQuantidade(), humanizar(), labelSegmento() (+4 more)

### Community 22 - "StatusView.tsx"
Cohesion: 0.18
Nodes (15): CrmContent(), CrmPage(), BADGE, CampanhaOption, Coluna, COLUNAS, formatarTelefone(), hrefUrl() (+7 more)

### Community 23 - "cnpj.ts"
Cohesion: 0.36
Nodes (6): buscarDonoPorNome(), DonoEncontrado, semAcento(), STOP, titulo(), tokens()

### Community 29 - "package.json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 30 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **152 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `(auth)/actions.ts`, `[id]/page.tsx`, `oportunidades/page.tsx`, `WhatsappPanel.tsx`, `getActiveOrg`, `captura.ts`, `creditos/actions.ts`, `DescubraForm.tsx`, `StatusView.tsx`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Why does `getActiveOrg` connect `getActiveOrg` to `[id]/page.tsx`, `oportunidades/page.tsx`, `createClient`, `WhatsappPanel.tsx`, `captura.ts`, `creditos/actions.ts`, `lp/page.tsx`, `StatusView.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `salvarInteressado()` connect `DescubraForm.tsx` to `createClient`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `securityHeaders`, `nextConfig` to the rest of the system?**
  _152 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `(auth)/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._