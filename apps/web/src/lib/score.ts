// Score de oportunidade: quão "quente" é o lead pra uma agência vender serviço.
// Lógica: quem TEM verba (já anuncia) e TEM necessidade (sem site) é ouro.

export interface SinaisLead {
  website: string | null;
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  nota: number | null;
  totalAvaliacoes: number | null;
  telefone: string | null;
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

  const semSite = !(l.website && l.website.trim());
  if (semSite) {
    v += 30;
    motivos.push("Sem site");
  }
  if (l.anunciaGoogle || l.anunciaMeta) {
    v += 40;
    motivos.push("Já anuncia (tem verba)");
  }

  const av = l.totalAvaliacoes ?? 0;
  if (av >= 50) {
    v += 15;
    motivos.push(`${av} avaliações`);
  } else if (av >= 10) {
    v += 8;
  }

  if ((l.nota ?? 0) >= 4.5) v += 5;
  if (l.telefone) {
    v += 10;
    motivos.push("Tem telefone");
  }
  if ((l.seguidores ?? 0) >= 5000) {
    v += 10;
    motivos.push("Presença no Instagram");
  }

  v = Math.min(100, v);
  const nivel: Nivel = v >= 70 ? "quente" : v >= 40 ? "morno" : "frio";
  return { valor: v, nivel, motivos };
}

export const NIVEL_INFO: Record<Nivel, { label: string; classe: string }> = {
  quente: { label: "🔥 Quente", classe: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20" },
  morno: { label: "🟡 Morno", classe: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" },
  frio: { label: "🔵 Frio", classe: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20" },
};
