import { createClient } from "@/lib/supabase/server";
import { planoPorId } from "@/lib/planos";
import type { ActiveOrg } from "@/lib/org";

// Renovação mensal "lazy" + expiração do plano anual. Ao carregar o dashboard:
//  - se o plano anual venceu (plano_expira_em passou), volta pro Free;
//  - senão, se passou a data de renovação, repõe os créditos do plano.
// Retorna o saldo total atualizado.
export async function garantirCreditos(org: ActiveOrg): Promise<number> {
  const agora = Date.now();
  const expirou = !!org.planoExpiraEm && new Date(org.planoExpiraEm).getTime() <= agora;
  const venceuMes = new Date(org.creditosRenovamEm).getTime() <= agora;

  // Nada a fazer neste render.
  if (!expirou && !venceuMes) return org.creditosPlano + org.creditosExtra;

  const proxima = new Date();
  proxima.setMonth(proxima.getMonth() + 1);
  const supabase = await createClient();

  // Plano anual chegou ao fim dos 12 meses → downgrade automático pro Free.
  if (expirou) {
    const free = planoPorId("free");
    await supabase
      .from("organizacoes")
      .update({
        plano: free.id,
        creditos_plano: free.creditosMes,
        creditos_renovam_em: proxima.toISOString(),
        plano_expira_em: null,
      })
      .eq("id", org.orgId);

    await supabase.from("creditos_transacoes").insert({
      organizacao_id: org.orgId,
      tipo: "inclusao_plano",
      quantidade: free.creditosMes,
      saldo_apos: free.creditosMes + org.creditosExtra,
      descricao: "Plano anual expirou (12 meses) — voltou para o Free",
    });

    return free.creditosMes + org.creditosExtra;
  }

  // Renovação mensal normal (mantém o plano atual).
  const plano = planoPorId(org.plano);
  await supabase
    .from("organizacoes")
    .update({
      creditos_plano: plano.creditosMes,
      creditos_renovam_em: proxima.toISOString(),
    })
    .eq("id", org.orgId);

  await supabase.from("creditos_transacoes").insert({
    organizacao_id: org.orgId,
    tipo: "inclusao_plano",
    quantidade: plano.creditosMes,
    saldo_apos: plano.creditosMes + org.creditosExtra,
    descricao: `Renovação mensal — plano ${plano.nome}`,
  });

  return plano.creditosMes + org.creditosExtra;
}

// Saldo atual (sem renovar).
export async function saldoDaOrg(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizacoes")
    .select("creditos_plano, creditos_extra")
    .eq("id", orgId)
    .maybeSingle();
  return (data?.creditos_plano ?? 0) + (data?.creditos_extra ?? 0);
}

// Adiciona créditos extras (recarga manual / admin). Registra no histórico.
export async function adicionarCreditosExtra(
  orgId: string,
  quantidade: number,
  descricao: string,
): Promise<void> {
  if (quantidade <= 0) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizacoes")
    .select("creditos_plano, creditos_extra")
    .eq("id", orgId)
    .maybeSingle();
  const novoExtra = (data?.creditos_extra ?? 0) + quantidade;
  await supabase.from("organizacoes").update({ creditos_extra: novoExtra }).eq("id", orgId);
  await supabase.from("creditos_transacoes").insert({
    organizacao_id: orgId,
    tipo: "recarga",
    quantidade,
    saldo_apos: (data?.creditos_plano ?? 0) + novoExtra,
    descricao,
  });
}
