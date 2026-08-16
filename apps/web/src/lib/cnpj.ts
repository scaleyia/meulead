// Enriquecimento do NOME DO DONO via CNPJ (best-effort, gratuito).
// Fluxo em 2 etapas: nome do negócio + UF -> acha o CNPJ (casadosdados)
// -> puxa o sócio (BrasilAPI). Só aceita match com confiança alta, pra não
// atribuir o dono errado (nome errado no disparo é pior que nome nenhum).

function semAcento(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Palavras genéricas que não ajudam a diferenciar a empresa.
const STOP = new Set([
  "farmacia", "de", "da", "do", "e", "ltda", "me", "epp", "manipulacao",
  "loja", "comercio", "clinica", "eireli", "sa", "the", "com", "servicos",
  "produtos", "matriz", "filial", "grupo", "sao", "restaurante", "bar",
]);

function tokens(s: string): string[] {
  return semAcento(s)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

// Extrai a UF de um endereço tipo "... São José do Rio Preto - SP, 15062-001".
export function ufDoEndereco(endereco: string | null): string | null {
  if (!endereco) return null;
  const m = endereco.match(/\b([A-Z]{2})\b(?=,?\s*\d{5}-?\d{3})/);
  return m ? m[1] : null;
}

function titulo(s: string): string {
  return s.toLowerCase().replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
}

export interface DonoEncontrado {
  dono: string;
  cnpj: string;
}

export async function buscarDonoPorNome(
  empresa: string,
  uf: string | null,
): Promise<DonoEncontrado | null> {
  try {
    const termo = empresa.trim();
    if (termo.length < 3) return null;

    const body = {
      query: {
        termo: [termo],
        atividade_principal: [],
        natureza_juridica: [],
        uf: uf ? [uf] : [],
        municipio: [],
        bairro: [],
        situacao_cadastral: "ATIVA",
        cnae: [],
      },
      page: 1,
    };

    const res = await fetch("https://api.casadosdados.com.br/v2/public/cnpj/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const lista: Record<string, unknown>[] = json?.data?.cnpj ?? json?.cnpj ?? [];
    if (!Array.isArray(lista) || !lista.length) return null;

    // Melhor candidato por sobreposição de tokens do nome.
    const alvo = new Set(tokens(termo));
    if (!alvo.size) return null;
    let melhor: Record<string, unknown> | null = null;
    let melhorScore = 0;
    for (const c of lista.slice(0, 10)) {
      const nomeCand = `${c.razao_social ?? ""} ${c.nome_fantasia ?? ""}`;
      const inter = tokens(nomeCand).filter((t) => alvo.has(t)).length;
      const score = inter / alvo.size;
      if (score > melhorScore) {
        melhorScore = score;
        melhor = c;
      }
    }
    // Confiança mínima: 60% dos tokens do negócio batem.
    if (!melhor || melhorScore < 0.6) return null;
    const cnpj = String(melhor.cnpj ?? "").replace(/\D/g, "");
    if (cnpj.length !== 14) return null;

    // Sócios via BrasilAPI.
    const r2 = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { cache: "no-store" });
    if (!r2.ok) return null;
    const dados = await r2.json();
    const qsa: Record<string, unknown>[] = dados?.qsa ?? [];
    const socio = qsa.find((s) => s?.nome_socio)?.nome_socio;
    if (!socio) return null;
    return { dono: titulo(String(socio)), cnpj };
  } catch {
    return null;
  }
}
