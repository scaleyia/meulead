import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@meulead/db";

type DB = SupabaseClient<Database>;

// Prepara os alvos de um disparo (round-robin entre os chips) e marca a campanha
// como "enviando". Usada tanto pela ação manual quanto pelo cron de agendamento.
// Idempotente: se a campanha já tem alvos, não duplica.
export async function prepararDisparo(
  supabase: DB,
  campanhaId: string,
  orgId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data: campanha } = await supabase
    .from("campanhas")
    .select("id, lista_id")
    .eq("id", campanhaId)
    .maybeSingle();

  if (!campanha) return { ok: false, error: "Campanha não encontrada." };
  if (!campanha.lista_id) return { ok: false, error: "Selecione uma lista antes de disparar." };

  // Já disparada? não duplica.
  const { count } = await supabase
    .from("campanha_alvos")
    .select("id", { count: "exact", head: true })
    .eq("campanha_id", campanha.id);
  if ((count ?? 0) > 0) {
    await supabase.from("campanhas").update({ status: "enviando" }).eq("id", campanha.id);
    return { ok: true };
  }

  const { data: pool } = await supabase
    .from("campanha_sessoes")
    .select("sessao_id")
    .eq("campanha_id", campanha.id);
  const chips = (pool ?? []).map((p) => p.sessao_id);
  if (chips.length === 0) return { ok: false, error: "Selecione ao menos um chip na campanha." };

  const { data: leads } = await supabase
    .from("leads")
    .select("id, telefone")
    .eq("lista_id", campanha.lista_id);
  if (!leads || leads.length === 0)
    return { ok: false, error: "A lista está vazia — nenhum contato para disparar." };

  const alvos = leads.map((lead, i) => ({
    organizacao_id: orgId,
    campanha_id: campanha.id,
    lead_id: lead.id,
    telefone: lead.telefone,
    sessao_id: chips[i % chips.length],
    status: "pendente" as const,
  }));

  const { error } = await supabase.from("campanha_alvos").insert(alvos);
  if (error) return { ok: false, error: error.message };

  await supabase.from("campanhas").update({ status: "enviando" }).eq("id", campanha.id);
  return { ok: true };
}
