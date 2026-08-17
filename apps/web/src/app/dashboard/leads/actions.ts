"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { checarNumerosWhatsapp, evolutionConfigurada } from "@/lib/evolution";

function soDigitos(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

// Valida quais leads têm WhatsApp (antes de disparar — economiza chip).
export async function validarWhatsapp(
  listaId: string | null,
): Promise<{ ok: boolean; error?: string; checados?: number; comWhats?: number }> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!evolutionConfigurada) {
    return { ok: false, error: "Conexão de WhatsApp indisponível." };
  }

  const supabase = await createClient();

  // Precisa de uma conexão de WhatsApp ativa.
  const { data: sessao } = await supabase
    .from("sessoes_whatsapp")
    .select("instancia, status")
    .eq("organizacao_id", org.orgId)
    .eq("status", "conectado")
    .limit(1)
    .maybeSingle();

  if (!sessao?.instancia) {
    return { ok: false, error: "Conecte um número em Conexões antes de validar." };
  }

  // Leads do Google Maps ainda não checados (com telefone).
  let query = supabase
    .from("leads")
    .select("id, telefone")
    .eq("organizacao_id", org.orgId)
    .eq("origem", "google_maps")
    .is("tem_whatsapp", null)
    .not("telefone", "is", null)
    .limit(200);
  if (listaId) query = query.eq("lista_id", listaId);

  const { data: leads } = await query;
  if (!leads?.length) return { ok: true, checados: 0, comWhats: 0 };

  const numeros = leads.map((l) => soDigitos(l.telefone)).filter(Boolean);
  const mapa = await checarNumerosWhatsapp(sessao.instancia, numeros);
  if (mapa.size === 0) {
    return { ok: false, error: "Não consegui validar agora. Verifique a conexão e tente de novo." };
  }

  let comWhats = 0;
  for (const lead of leads) {
    const num = soDigitos(lead.telefone);
    const tem = mapa.get(num) ?? false;
    if (tem) comWhats++;
    await supabase.from("leads").update({ tem_whatsapp: tem }).eq("id", lead.id);
  }

  revalidatePath("/dashboard/leads");
  return { ok: true, checados: leads.length, comWhats };
}
