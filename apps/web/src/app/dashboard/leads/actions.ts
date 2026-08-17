"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { checarNumerosWhatsapp, evolutionConfigurada } from "@/lib/evolution";
import { analisarSite } from "@/lib/site";

function soDigitos(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

// Valida quais leads têm WhatsApp (antes de disparar — economiza chip).
export async function validarWhatsapp(
  listaId: string | null,
): Promise<{
  ok: boolean;
  error?: string;
  checados?: number;
  comWhats?: number;
  removidos?: number;
}> {
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
  let removidos = 0;
  for (const lead of leads) {
    const num = soDigitos(lead.telefone);
    const tem = mapa.get(num) ?? false;
    if (tem) {
      comWhats++;
      await supabase.from("leads").update({ tem_whatsapp: true }).eq("id", lead.id);
    } else {
      // Número sem WhatsApp: remove o lead (não serve pra disparo).
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id)
        .eq("organizacao_id", org.orgId);
      if (!error) removidos++;
    }
  }

  // Estorna 1 crédito por lead removido (foi cobrado na captação).
  if (removidos > 0) {
    const { data: o } = await supabase
      .from("organizacoes")
      .select("creditos_plano, creditos_extra")
      .eq("id", org.orgId)
      .maybeSingle();
    const novoExtra = (o?.creditos_extra ?? 0) + removidos;
    await supabase
      .from("organizacoes")
      .update({ creditos_extra: novoExtra })
      .eq("id", org.orgId);
    await supabase.from("creditos_transacoes").insert({
      organizacao_id: org.orgId,
      tipo: "ajuste",
      quantidade: removidos,
      saldo_apos: (o?.creditos_plano ?? 0) + novoExtra,
      descricao: `Estorno: ${removidos} lead(s) sem WhatsApp removido(s)`,
    });
  }

  revalidatePath("/dashboard/leads");
  return { ok: true, checados: leads.length, comWhats, removidos };
}

// Analisa a qualidade/SEO do site de um lead (sob demanda).
export async function analisarSiteLead(
  leadId: string,
): Promise<{ ok: boolean; error?: string }> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id, website")
    .eq("id", leadId)
    .eq("organizacao_id", org.orgId)
    .maybeSingle();

  if (!lead) return { ok: false, error: "Lead não encontrado." };
  if (!lead.website || !lead.website.trim()) {
    return { ok: false, error: "Lead sem site para analisar." };
  }

  const r = await analisarSite(lead.website);
  await supabase
    .from("leads")
    .update({
      site_score: r?.score ?? 0,
      site_carga_ms: r?.cargaMs ?? null,
      site_analisado: true,
    })
    .eq("id", leadId)
    .eq("organizacao_id", org.orgId);

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");
  return { ok: true };
}
