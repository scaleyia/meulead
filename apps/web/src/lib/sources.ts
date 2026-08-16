import type { LeadSource } from "@meulead/shared";

// Rótulos e ícones amigáveis para as fontes de lead.
export const SOURCE_LABELS: Record<LeadSource, string> = {
  google_maps: "Google Maps",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  cnpj: "CNPJ / Receita",
  manual: "Manual",
  import: "Importação (CSV)",
};

export const SOURCE_OPTIONS: LeadSource[] = [
  "manual",
  "import",
  "google_maps",
  "instagram",
  "linkedin",
  "cnpj",
];

export function sourceLabel(s: string | null | undefined): string {
  if (!s) return "—";
  return SOURCE_LABELS[s as LeadSource] ?? s;
}
