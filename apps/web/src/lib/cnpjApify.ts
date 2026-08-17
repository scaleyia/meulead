// Enriquecimento do DONO via Apify (discovery da Receita por CNAE + município).
// Fluxo: capta o segmento inteiro na cidade -> casa cada empresa (telefone/nome)
// -> extrai o sócio (LTDA) ou a razão social (MEI/empresário individual).

import { iniciarRun, statusRun, itensDataset } from "@/lib/apify";

const ACTOR_DISCOVERY = "johnatan029~cnpj-empresas-brasil-scraper";
const TERMINADOS = ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"];

function semAcento(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Resolve o código IBGE do município a partir de "Cidade, UF".
export async function resolverMunicipio(
  cidade: string,
  uf: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const lista: { id: number; nome: string }[] = await res.json();
    const alvo = semAcento(cidade).trim();
    const m =
      lista.find((x) => semAcento(x.nome) === alvo) ??
      lista.find((x) => semAcento(x.nome).includes(alvo) || alvo.includes(semAcento(x.nome)));
    return m ? String(m.id) : null;
  } catch {
    return null;
  }
}

// Separa "São José do Rio Preto, SP" -> { cidade, uf }.
export function separarLocalizacao(loc: string): { cidade: string; uf: string | null } {
  const m = loc.match(/^(.*?)[,\-\s]+([A-Za-z]{2})\s*$/);
  if (m) return { cidade: m[1].trim(), uf: m[2].toUpperCase() };
  return { cidade: loc.trim(), uf: null };
}

// Extrai a cidade + UF mais comum de uma lista de endereços do Google Maps.
// Ex: "R. XV, 3358 - Centro, São José do Rio Preto - SP, 15015-110, Brasil".
export function cidadeUfDeEnderecos(
  enderecos: (string | null)[],
): { cidade: string; uf: string } | null {
  const contagem = new Map<string, { cidade: string; uf: string; n: number }>();
  for (const end of enderecos) {
    if (!end) continue;
    const m = end.match(/,\s*([^,]+?)\s*-\s*([A-Z]{2}),\s*\d{5}/);
    if (!m) continue;
    const cidade = m[1].trim();
    const uf = m[2].toUpperCase();
    const chave = `${semAcento(cidade)}|${uf}`;
    const cur = contagem.get(chave) ?? { cidade, uf, n: 0 };
    cur.n++;
    contagem.set(chave, cur);
  }
  let melhor: { cidade: string; uf: string; n: number } | null = null;
  for (const v of contagem.values()) if (!melhor || v.n > melhor.n) melhor = v;
  return melhor ? { cidade: melhor.cidade, uf: melhor.uf } : null;
}

// Dispara o discovery (assíncrono). Devolve o run id.
export async function iniciarDiscoveryDonos(
  cnae: string,
  uf: string,
  municipio: string,
): Promise<string | null> {
  const run = await iniciarRun(ACTOR_DISCOVERY, {
    mode: "discovery",
    cnae,
    uf,
    municipio,
    maxResults: 300,
  });
  return run?.id ?? null;
}

interface Empresa {
  razaoSocial?: string;
  nomeFantasia?: string;
  telefones?: string[];
  opcaoMei?: boolean;
  naturezaJuridica?: string;
  socios?: { nome?: string }[];
}

function titulo(s: string): string {
  return s.toLowerCase().replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
}

// Extrai o nome do dono de uma empresa do discovery.
function donoDeEmpresa(e: Empresa): string | null {
  const socios = e.socios ?? [];
  const socio = socios.find((s) => s?.nome)?.nome;
  if (socio) return titulo(String(socio));
  // MEI / empresário individual: a razão social É o nome da pessoa.
  const nj = semAcento(String(e.naturezaJuridica ?? ""));
  const individual = e.opcaoMei || nj.includes("individual") || nj.includes("empresario");
  if (individual && e.razaoSocial) return titulo(e.razaoSocial);
  return null;
}

function digitos(s: string | null | undefined): string {
  const d = String(s ?? "").replace(/\D/g, "");
  return d.startsWith("55") ? d.slice(2) : d;
}

const STOP = new Set([
  "farmacia", "de", "da", "do", "e", "ltda", "me", "epp", "manipulacao",
  "comercio", "clinica", "loja", "-", "sa", "eireli",
]);
function tokens(s: string): Set<string> {
  return new Set(
    semAcento(s).replace(/[^\w\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

export interface IndiceDonos {
  porTelefone: Map<string, string>;
  empresas: { nomeTokens: Set<string>; dono: string }[];
}

// Constrói o índice de donos a partir dos itens do discovery.
export function construirIndice(itens: Record<string, unknown>[]): IndiceDonos {
  const porTelefone = new Map<string, string>();
  const empresas: { nomeTokens: Set<string>; dono: string }[] = [];
  for (const raw of itens) {
    const e = raw as Empresa;
    const dono = donoDeEmpresa(e);
    if (!dono) continue;
    for (const t of e.telefones ?? []) {
      const d = digitos(t);
      if (d.length >= 10) porTelefone.set(d, dono);
    }
    const nome = e.nomeFantasia || e.razaoSocial || "";
    if (nome) empresas.push({ nomeTokens: tokens(nome), dono });
  }
  return { porTelefone, empresas };
}

// Casa um lead (telefone/empresa) com o índice e devolve o dono, se achar.
export function acharDono(
  indice: IndiceDonos,
  telefone: string | null,
  empresa: string | null,
): string | null {
  const d = digitos(telefone);
  if (d.length >= 10 && indice.porTelefone.has(d)) return indice.porTelefone.get(d)!;
  if (empresa) {
    const alvo = tokens(empresa);
    if (alvo.size) {
      let melhor: { dono: string; score: number } | null = null;
      for (const emp of indice.empresas) {
        let inter = 0;
        for (const t of alvo) if (emp.nomeTokens.has(t)) inter++;
        const score = inter / alvo.size;
        if (score >= 0.6 && (!melhor || score > melhor.score)) melhor = { dono: emp.dono, score };
      }
      if (melhor) return melhor.dono;
    }
  }
  return null;
}

// Verifica o run do discovery. done=false -> ainda rodando.
export async function resolverDiscovery(
  runId: string,
): Promise<{ done: boolean; itens: Record<string, unknown>[] }> {
  const run = await statusRun(runId);
  if (!run || !TERMINADOS.includes(run.status)) return { done: false, itens: [] };
  if (run.status !== "SUCCEEDED") return { done: true, itens: [] };
  const itens = await itensDataset(run.defaultDatasetId, 400);
  return { done: true, itens };
}
