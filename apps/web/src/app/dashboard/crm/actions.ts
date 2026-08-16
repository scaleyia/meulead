"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { iniciarAdsGoogle, iniciarAdsMeta } from "@/lib/ads";

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

// Dispara a verificação de anúncios (Google Ads + Meta Ads) de um lead.
// Sob demanda pra controlar o custo do Apify. O polling nas páginas resolve.
export async function verificarAnuncios(
  leadId: string,
): Promise<{ ok: boolean; error?: string }> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id, empresa, website")
    .eq("id", leadId)
    .eq("organizacao_id", org.orgId)
    .maybeSingle();

  if (!lead?.empresa) return { ok: false, error: "Lead sem nome de empresa." };

  const [runGoogle, runMeta] = await Promise.all([
    iniciarAdsGoogle(lead.empresa, lead.website),
    iniciarAdsMeta(lead.empresa),
  ]);

  if (!runGoogle && !runMeta) {
    return { ok: false, error: "Não consegui iniciar a verificação. Tente de novo." };
  }

  await supabase
    .from("leads")
    .update({
      ads_run_google: runGoogle,
      ads_run_meta: runMeta,
      anuncia_google: null,
      anuncia_meta: null,
    })
    .eq("id", leadId)
    .eq("organizacao_id", org.orgId);

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/leads");
  return { ok: true };
}
