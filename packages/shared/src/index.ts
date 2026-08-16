// Tipos de domínio compartilhados entre web e worker/n8n.

export type LeadSource = "google_maps" | "instagram" | "linkedin" | "cnpj" | "manual" | "import";

export interface Organizacao {
  id: string;
  nome: string;
  criado_em: string;
}

export interface Lead {
  id: string;
  organizacao_id: string;
  lista_id: string | null;
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  origem: LeadSource;
  dados_brutos: Record<string, unknown> | null;
  criado_em: string;
}

export interface Lista {
  id: string;
  organizacao_id: string;
  nome: string;
  origem: LeadSource | null;
  criado_em: string;
}
