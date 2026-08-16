"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";

const COLUNAS_VALIDAS = ["nao_disparado", "pendente", "enviado", "entregue", "falhou"] as const;
type Coluna = (typeof COLUNAS_VALIDAS)[number];

// Move um lead entre colunas do CRM (override manual — persiste em leads.status_crm).
export async function moverLeadStatus(
  leadId: string,
  coluna: string,
): Promise<{ ok: boolean; error?: string }> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!COLUNAS_VALIDAS.includes(coluna as Coluna)) {
    return { ok: false, error: "Status inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status_crm: coluna })
    .eq("id", leadId)
    .eq("organizacao_id", org.orgId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/crm");
  return { ok: true };
}
