# @meulead/db

Schema do banco (Supabase/Postgres) do MeuLead.

## Aplicar a migration

Depois de preencher `SUPABASE_DB_URL` no `.env` da raiz:

```bash
# a partir da raiz do projeto
psql "$SUPABASE_DB_URL" -f packages/db/migrations/0001_init.sql
```

> Alternativa sem psql: abra o **SQL Editor** no painel do Supabase, cole o
> conteúdo de `migrations/0001_init.sql` e rode.

## Gerar os tipos TypeScript (opcional)

```bash
pnpm db:types   # gera packages/db/src/database.types.ts a partir do banco local
```

## Tabelas

- `orgs` — empresa cliente (tenant)
- `members` — usuários de cada org (owner/admin/member)
- `lead_lists` — listas de leads
- `leads` — leads captados (Apify) ou importados
- `contacts` — contatos derivados dos leads

Isolamento por `org_id` via **Row Level Security**. Um trigger em `auth.users`
cria a org + membership automaticamente no cadastro.
