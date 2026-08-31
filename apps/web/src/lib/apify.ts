// Cliente Apify — o app chama o Apify direto (sem depender do n8n) e controla
// o mapeamento da qualificação (site, nota, endereço, Instagram) no código.

const BASE = "https://api.apify.com/v2";

// Actors usados. O separador "~" é o formato de ID via API (usuario~actor).
export const ACTOR_GOOGLE_MAPS = "compass~crawler-google-places";
export const ACTOR_INSTAGRAM = "apify~instagram-scraper";

function token(): string | null {
  return process.env.APIFY_TOKEN ?? null;
}

export interface ApifyRun {
  id: string;
  status: string; // READY, RUNNING, SUCCEEDED, FAILED, ABORTED, TIMED-OUT
  defaultDatasetId: string;
}

// Dispara um run assíncrono e devolve o run (id + dataset).
export async function iniciarRun(
  actorId: string,
  input: Record<string, unknown>,
): Promise<ApifyRun | null> {
  const t = token();
  if (!t) return null;
  const res = await fetch(`${BASE}/acts/${actorId}/runs?token=${t}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  const d = json?.data;
  if (!d?.id) return null;
  return { id: d.id, status: d.status, defaultDatasetId: d.defaultDatasetId };
}

// Consulta o estado de um run.
export async function statusRun(runId: string): Promise<ApifyRun | null> {
  const t = token();
  if (!t) return null;
  const res = await fetch(`${BASE}/actor-runs/${runId}?token=${t}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  const d = json?.data;
  if (!d?.id) return null;
  return { id: d.id, status: d.status, defaultDatasetId: d.defaultDatasetId };
}

// Baixa os itens do dataset (resultado do run).
export async function itensDataset(
  datasetId: string,
  limit = 500,
): Promise<Record<string, unknown>[]> {
  const t = token();
  if (!t) return [];
  const res = await fetch(
    `${BASE}/datasets/${datasetId}/items?token=${t}&clean=true&limit=${limit}`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export function apifyDisponivel(): boolean {
  return !!token();
}

// ---- Instagram: captação em 2 etapas ----
// A busca por palavra-chave do Instagram é ranqueada por popularidade global
// (traz Katy Perry pra "clínica"). O caminho confiável é:
//   1) descoberta   — raspa POSTS de hashtags/local e coleta os autores;
//   2) qualificação — raspa os PERFIS (details) e filtra só contas comerciais.

// Normaliza uma hashtag: tira '#', espaços e deixa minúscula (mantém acentos).
export function limparHashtag(raw: string): string {
  return raw.replace(/^#/, "").replace(/\s+/g, "").toLowerCase();
}

// Etapa 1 — descobre perfis raspando posts de hashtags ou de um local.
// `limite` é o nº de posts a raspar (proxy do nº de perfis candidatos).
export async function iniciarInstagramDescoberta(opts: {
  metodo: "hashtag" | "local";
  termos: string[];
  localizacao?: string;
  limite: number;
}): Promise<ApifyRun | null> {
  const { metodo, termos, localizacao, limite } = opts;

  const input: Record<string, unknown> =
    metodo === "hashtag"
      ? {
          directUrls: termos
            .map(limparHashtag)
            .filter(Boolean)
            .map((t) => `https://www.instagram.com/explore/tags/${encodeURIComponent(t)}/`),
          resultsType: "posts",
          resultsLimit: limite,
        }
      : {
          // Busca a página de local (geotag) e raspa quem postou ali.
          search: [termos.join(" "), localizacao].filter(Boolean).join(" ").trim(),
          searchType: "place",
          searchLimit: 3,
          resultsType: "posts",
          resultsLimit: limite,
        };

  return iniciarRun(ACTOR_INSTAGRAM, input);
}

// Etapa 2 — raspa os PERFIS (details) dos autores descobertos.
export async function iniciarInstagramQualificacao(
  usernames: string[],
): Promise<ApifyRun | null> {
  if (!usernames.length) return null;
  return iniciarRun(ACTOR_INSTAGRAM, {
    directUrls: usernames.map((u) => `https://www.instagram.com/${u}/`),
    resultsType: "details",
    resultsLimit: 1,
    addParentData: false,
  });
}
