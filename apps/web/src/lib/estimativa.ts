// Estimador (grátis, instantâneo) de quantos donos existem por segmento + estado.
// Base nacional aproximada por segmento × participação do estado (por população).
// É uma ESTIMATIVA para o lead-magnet — sempre exibir como "~aproximado".

import { SEGMENTOS } from "@/lib/segmentos";

// Nº aproximado de estabelecimentos ativos no Brasil por segmento (ordem de grandeza).
const BASE_NACIONAL: Record<string, number> = {
  "5611201": 1_300_000, // Restaurantes
  "5611203": 480_000, // Lanchonetes / Hamburguerias
  "5611205": 560_000, // Bares
  "4721102": 260_000, // Padarias
  "9313100": 44_000, // Academias
  "9602501": 720_000, // Salões / Cabeleireiros
  "8630504": 120_000, // Clínicas odontológicas
  "4771701": 90_000, // Farmácias
  "4774100": 38_000, // Óticas
  "4789004": 40_000, // Pet shops
  "4520001": 300_000, // Oficinas mecânicas
  "4781400": 380_000, // Lojas de roupas
  "4712100": 520_000, // Mercados / Mercearias
  "6821801": 120_000, // Imobiliárias
  "6911701": 210_000, // Advocacia
  "6920601": 95_000, // Contabilidade
  "5510801": 30_000, // Hotéis e pousadas
  "4120400": 220_000, // Construtoras
  "8593700": 26_000, // Escolas de idiomas
};

// Participação de cada estado (aprox. população %).
const PESO_UF: Record<string, number> = {
  SP: 0.216, MG: 0.099, RJ: 0.079, BA: 0.069, PR: 0.055, RS: 0.052, PE: 0.045,
  CE: 0.043, PA: 0.04, SC: 0.037, MA: 0.033, GO: 0.034, AM: 0.02, ES: 0.019,
  PB: 0.019, RN: 0.017, MT: 0.018, AL: 0.015, PI: 0.016, DF: 0.014, MS: 0.013,
  SE: 0.011, RO: 0.008, TO: 0.007, AC: 0.004, AP: 0.004, RR: 0.003,
};

const MEDIA_UF = 1 / 27;

// Arredonda para um número "natural" (não redondo demais).
function humanizar(n: number): number {
  if (n < 50) return Math.max(8, n);
  if (n < 1000) return Math.round(n / 10) * 10;
  return Math.round(n / 50) * 50;
}

export function estimarQuantidade(cnae: string, uf: string): number {
  const base = BASE_NACIONAL[cnae] ?? 150_000;
  const peso = PESO_UF[uf] ?? MEDIA_UF;
  // ~25-40% costuma ter sócio pessoa física identificável (o "dono").
  return humanizar(base * peso * 0.32);
}

export function labelSegmento(cnae: string): string {
  return SEGMENTOS.find((s) => s.cnae === cnae)?.label ?? "empresas";
}
