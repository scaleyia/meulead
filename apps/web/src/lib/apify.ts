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
