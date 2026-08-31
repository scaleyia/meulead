-- 0002 — Captação do Instagram em 2 etapas.
--
-- A busca por palavra-chave no Instagram devolvia perfis globais aleatórios
-- (Katy Perry, etc.) porque o ranking dele é por popularidade, sem geo/nicho.
-- O caminho confiável é em 2 etapas:
--   1) descoberta   — raspa POSTS de uma hashtag/local e coleta os ownerUsername;
--   2) qualificacao — raspa os PERFIS (details) e filtra só contas comerciais.
--
-- `fase` guarda em qual etapa o job de Instagram está. Jobs do Google Maps
-- não usam essa coluna (ficam NULL).

alter table public.jobs_apify
  add column if not exists fase text
    check (fase in ('descoberta', 'qualificacao'));

comment on column public.jobs_apify.fase is
  'Instagram 2 etapas: descoberta (posts da hashtag/local -> usernames) e qualificacao (details dos perfis). NULL para Google Maps.';
