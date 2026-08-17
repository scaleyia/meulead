// Score de oportunidade: quão "quente" é o lead pra uma agência vender serviço.
// Lógica: quem TEM verba/porte (anuncia, muitas avaliações) e TEM necessidade
// (sem site OU site fraco) e é CONTATÁVEL (WhatsApp/dono) é ouro.

export interface SinaisLead {
  website: string | null;
  siteScore: number | null; // 0-100 (análise de site); null = não analisado
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  nota: number | null;
  totalAvaliacoes: number | null;
  telefone: string | null;
  temWhatsapp: boolean | null;
  temDono: boolean; // nome do dono identificado
  seguidores: number | null;
}

export type Nivel = "quente" | "morno" | "frio";

export interface Score {
  valor: number; // 0-100
  nivel: Nivel;
  motivos: string[];
}

export function calcularScore(l: SinaisLead): Score {
  let v = 0;
  const motivos: string[] = [];

  // --- NECESSIDADE (o gancho de venda) ---
  const semSite = !(l.website && l.website.trim());
  if (semSite) {
    v += 35;
    motivos.push("Sem site");
  } else if (l.siteScore != null && l.siteScore < 60) {
    v += 25;
    motivos.push("Site fraco");
  }

  // --- VERBA / PORTE (mostra que tem dinheiro e movimento) ---
  if (l.anunciaGoogle || l.anunciaMeta) {
    v += 30;
    motivos.push("Já anuncia (tem verba)");
  }
  const av = l.totalAvaliacoes ?? 0;
  if (av >= 200) {
    v += 20;
    motivos.push(`${av} avaliações (grande)`);
  } else if (av >= 50) {
    v += 12;
    motivos.push(`${av} avaliações`);
  } else if (av >= 10) {
    v += 6;
  }
  if ((l.nota ?? 0) >= 4.5) v += 5;

  // --- CONTATÁVEL (facilita fechar) ---
  if (l.temWhatsapp === true) {
    v += 8;
    motivos.push("WhatsApp ✓");
  } else if (l.telefone) {
    v += 5;
  }
  if (l.temDono) {
    v += 7;
    motivos.push("Dono identificado");
  }

  // --- BÔNUS ---
  if ((l.seguidores ?? 0) >= 5000) {
    v += 8;
    motivos.push("Presença no Instagram");
  }

  v = Math.min(100, v);
  const nivel: Nivel = v >= 65 ? "quente" : v >= 35 ? "morno" : "frio";
  return { valor: v, nivel, motivos };
}

export const NIVEL_INFO: Record<Nivel, { label: string; classe: string }> = {
  quente: { label: "🔥 Quente", classe: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20" },
  morno: { label: "🟡 Morno", classe: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" },
  frio: { label: "🔵 Frio", classe: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20" },
};
