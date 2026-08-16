"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";

export type ActionResult = { ok: true } | { ok: false; error: string };

// Defaults seguros aplicados quando o modo de envio é automático.
const AUTO_DEFAULTS = { intervaloMin: 30, intervaloMax: 90, limiteDiario: 200 };

export async function criarCampanha(input: {
  nome: string;
  listaId: string | null;
  mensagem: string;
  sessaoIds: string[];
  modoEnvio: "auto" | "manual";
  intervaloMin: number;
  intervaloMax: number;
  limiteDiario: number;
}): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!input.nome.trim()) return { ok: false, error: "Dê um nome à campanha." };
  if (!input.mensagem.trim()) return { ok: false, error: "Escreva a mensagem do disparo." };

  // No modo automático o sistema escolhe intervalos/limite seguros.
  const modoEnvio = input.modoEnvio === "manual" ? "manual" : "auto";
  const config =
    modoEnvio === "auto"
      ? AUTO_DEFAULTS
      : {
          intervaloMin: input.intervaloMin,
          intervaloMax: input.intervaloMax,
          limiteDiario: input.limiteDiario,
        };

  const supabase = await createClient();

  const { data: campanha, error } = await supabase
    .from("campanhas")
    .insert({
      organizacao_id: org.orgId,
      nome: input.nome.trim(),
      lista_id: input.listaId || null,
      mensagem: input.mensagem.trim(),
      status: "rascunho",
      modo_envio: modoEnvio,
      intervalo_min: config.intervaloMin,
      intervalo_max: config.intervaloMax,
      limite_diario: config.limiteDiario,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Pool de chips da campanha (contingência com revezamento).
  const sessaoIds = [...new Set(input.sessaoIds.filter(Boolean))];
  if (sessaoIds.length > 0) {
    const { error: poolErr } = await supabase.from("campanha_sessoes").insert(
      sessaoIds.map((sessaoId) => ({
        organizacao_id: org.orgId,
        campanha_id: campanha.id,
        sessao_id: sessaoId,
      })),
    );
    if (poolErr) return { ok: false, error: poolErr.message };
  }

  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

// O envio real é orquestrado pelo n8n + Evolution API. Aqui apenas preparamos
// os alvos, distribuindo os leads entre os chips do pool (round-robin), e
// marcamos a campanha como "enviando". O n8n processa a fila de campanha_alvos
// respeitando intervalos/limite e revezando os chips.
export async function dispararCampanha(campanhaId: string): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const supabase = await createClient();

  const { data: campanha, error: campErr } = await supabase
    .from("campanhas")
    .select("id, lista_id")
    .eq("id", campanhaId)
    .maybeSingle();

  if (campErr) return { ok: false, error: campErr.message };
  if (!campanha) return { ok: false, error: "Campanha não encontrada." };
  if (!campanha.lista_id)
    return { ok: false, error: "Selecione uma lista antes de disparar." };

  // Pool de chips da campanha — sem chips não há como revezar.
  const { data: pool, error: poolErr } = await supabase
    .from("campanha_sessoes")
    .select("sessao_id")
    .eq("campanha_id", campanha.id);

  if (poolErr) return { ok: false, error: poolErr.message };
  const chips = (pool ?? []).map((p) => p.sessao_id);
  if (chips.length === 0)
    return { ok: false, error: "Selecione ao menos um chip na campanha." };

  const { data: leads, error: leadsErr } = await supabase
    .from("leads")
    .select("id, telefone, nome")
    .eq("lista_id", campanha.lista_id);

  if (leadsErr) return { ok: false, error: leadsErr.message };
  if (!leads || leads.length === 0)
    return { ok: false, error: "A lista está vazia — nenhum contato para disparar." };

  // Revezamento round-robin: cada lead vai para o próximo chip do pool.
  const alvos = leads.map((lead, i) => ({
    organizacao_id: org.orgId,
    campanha_id: campanha.id,
    lead_id: lead.id,
    telefone: lead.telefone,
    sessao_id: chips[i % chips.length],
    status: "pendente" as const,
  }));

  const { error: alvosErr } = await supabase.from("campanha_alvos").insert(alvos);
  if (alvosErr) return { ok: false, error: alvosErr.message };

  const { error: updErr } = await supabase
    .from("campanhas")
    .update({ status: "enviando" })
    .eq("id", campanha.id);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/crm");
  return { ok: true };
}

export async function excluirCampanha(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("campanhas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}
