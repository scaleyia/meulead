// Detecção de anúncios (Google Ads Transparency + Meta Ad Library) via Apify.
// Atores testados e funcionando:
//   Google: solidcode~ads-transparency-scraper (busca por anunciante — preciso)
//   Meta:   apify~facebook-ads-scraper (busca na Ad Library por palavra-chave)
// Como o Meta casa por TEXTO do anúncio, filtramos pelo nome da página pra
// reduzir falso-positivo.

import { iniciarRun, statusRun, itensDataset } from "@/lib/apify";

const ACTOR_GOOGLE_ADS = "solidcode~ads-transparency-scraper";
const ACTOR_META_ADS = "apify~facebook-ads-scraper";

const TERMINADOS = ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"];

function semAcento(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
const STOP = new Set([
  "farmacia", "de", "da", "do", "e", "ltda", "me", "epp", "manipulacao", "loja",
  "comercio", "clinica", "eireli", "sa", "the", "com", "restaurante", "bar",
  "matriz", "filial", "grupo", "sao", "-", "ltda.", "s", "a",
]);
function tokens(s: string): Set<string> {
  return new Set(
    semAcento(s)
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}
// A empresa "casa" com um nome de anunciante se metade+ dos tokens dela aparecem.
function casa(empresa: string, candidato: string): boolean {
  const alvo = tokens(empresa);
  if (!alvo.size) return false;
  const cand = tokens(candidato);
  let inter = 0;
  for (const t of alvo) if (cand.has(t)) inter++;
  return inter / alvo.size >= 0.5;
}

function metaUrl(empresa: string): string {
  const q = encodeURIComponent(empresa);
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${q}&search_type=keyword_unordered`;
}

// Extrai o domínio registrável de uma URL: https://www.abc.com.br/loja -> abc.com.br
function dominio(url: string): string {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .trim();
}

// Google Ads: se o lead tem site, busca pelo DOMÍNIO (o Google verifica o
// anunciante por domínio — muito mais confiável que o nome da loja, que costuma
// diferir da razão social da conta de anúncios). Sem site, cai pro nome.
export async function iniciarAdsGoogle(
  empresa: string,
  website: string | null,
): Promise<string | null> {
  const query = website && website.trim() ? dominio(website) : empresa;
  const run = await iniciarRun(ACTOR_GOOGLE_ADS, {
    searchQuery: query,
    region: "BR",
    maxResults: 5,
  });
  return run?.id ?? null;
}

export async function iniciarAdsMeta(empresa: string): Promise<string | null> {
  const run = await iniciarRun(ACTOR_META_ADS, {
    startUrls: [{ url: metaUrl(empresa) }],
    resultsLimit: 10,
  });
  return run?.id ?? null;
}

interface Resolucao {
  done: boolean;
  anuncia: boolean;
}

// Verifica o run do Google. done=false → ainda rodando.
// Se a busca foi por domínio (tem site), qualquer anúncio conta (o domínio é do
// próprio negócio). Se foi por nome, exige casar o nome do anunciante.
export async function resolverAdsGoogle(
  runId: string,
  empresa: string,
  website: string | null,
): Promise<Resolucao> {
  const run = await statusRun(runId);
  if (!run || !TERMINADOS.includes(run.status)) return { done: false, anuncia: false };
  if (run.status !== "SUCCEEDED") return { done: true, anuncia: false };
  const itens = await itensDataset(run.defaultDatasetId, 10);
  if (website && website.trim()) {
    return { done: true, anuncia: itens.length > 0 };
  }
  const anuncia = itens.some((it) => casa(empresa, String(it.advertiserName ?? "")));
  return { done: true, anuncia };
}

// Verifica o run do Meta. Casa o nome da página pra evitar falso-positivo.
export async function resolverAdsMeta(runId: string, empresa: string): Promise<Resolucao> {
  const run = await statusRun(runId);
  if (!run || !TERMINADOS.includes(run.status)) return { done: false, anuncia: false };
  if (run.status !== "SUCCEEDED") return { done: true, anuncia: false };
  const itens = await itensDataset(run.defaultDatasetId, 20);
  const anuncia = itens.some((it) => {
    const snap = (it.snapshot ?? {}) as Record<string, unknown>;
    const pageName = String(it.pageName ?? snap.page_name ?? "");
    return pageName && casa(empresa, pageName);
  });
  return { done: true, anuncia };
}
