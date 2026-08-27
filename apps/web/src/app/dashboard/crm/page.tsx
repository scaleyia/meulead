import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { resolverAnuncios } from "@/lib/captura";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StatusView, type StatusItem, type CampanhaOption } from "@/components/StatusView";

export default async function CrmPage() {
  const org = await getActiveOrg();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Status dos disparos</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Todos os seus leads e onde cada um está no disparo — atualiza sozinho.
        </p>
      </div>

      {org ? <CrmContent orgId={org.orgId} planoPago={org.plano !== "free"} /> : <EmptyState />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
      <p className="text-4xl">📡</p>
      <h2 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhum lead no CRM ainda</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Em <strong>Leads</strong>, clique em <strong>→ CRM</strong> para trazer um lead pra cá — ou
        faça um <strong>disparo</strong>. Só entram no CRM os leads que você mandar ou disparar.
      </p>
    </div>
  );
}

async function CrmContent({ orgId, planoPago }: { orgId: string; planoPago: boolean }) {
  const supabase = await createClient();

  // Resolve verificações de anúncios que já terminaram no Apify.
  try {
    await resolverAnuncios(orgId);
  } catch {
    // segue carregando normalmente
  }

  // Base = todos os leads da org (o filtro de "quem entra no CRM" vem depois).
  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, nome, empresa, telefone, email, origem, status_crm, no_crm, website, instagram, seguidores, nota, endereco, anuncia_google, anuncia_meta, ads_run_google, ads_run_meta",
    )
    .eq("organizacao_id", orgId)
    .order("criado_em", { ascending: false });

  if (!leads || leads.length === 0) {
    return <EmptyState />;
  }

  // Alvos de disparo — para saber o status de cada lead (quando já foi disparado).
  const { data: alvos } = await supabase
    .from("campanha_alvos")
    .select("lead_id, campanha_id, sessao_id, status, enviado_em")
    .eq("organizacao_id", orgId)
    .order("enviado_em", { ascending: false, nullsFirst: false });

  // Mantém o alvo mais recente por lead.
  const alvoPorLead = new Map<string, { campanha_id: string; sessao_id: string | null; status: string }>();
  for (const a of alvos ?? []) {
    if (a.lead_id && !alvoPorLead.has(a.lead_id)) {
      alvoPorLead.set(a.lead_id, {
        campanha_id: a.campanha_id,
        sessao_id: a.sessao_id,
        status: a.status ?? "pendente",
      });
    }
  }

  const campanhaIds = [...new Set([...alvoPorLead.values()].map((a) => a.campanha_id))];
  const sessaoIds = [...new Set([...alvoPorLead.values()].map((a) => a.sessao_id).filter((v): v is string => !!v))];

  const [campanhasRes, sessoesRes] = await Promise.all([
    campanhaIds.length
      ? supabase.from("campanhas").select("id, nome").in("id", campanhaIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null }[] }),
    sessaoIds.length
      ? supabase.from("sessoes_whatsapp").select("id, nome").in("id", sessaoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null }[] }),
  ]);

  const campanhasMap = new Map((campanhasRes.data ?? []).map((c) => [c.id, c]));
  const sessoesMap = new Map((sessoesRes.data ?? []).map((s) => [s.id, s]));

  // Só entra no CRM quem foi enviado manualmente (no_crm) OU teve algum disparo.
  const leadsNoCrm = leads.filter((lead) => lead.no_crm || alvoPorLead.has(lead.id));

  if (leadsNoCrm.length === 0) {
    return <EmptyState />;
  }

  const items: StatusItem[] = leadsNoCrm.map((lead) => {
    const alvo = alvoPorLead.get(lead.id);
    const campanha = alvo ? campanhasMap.get(alvo.campanha_id) : undefined;
    const sessao = alvo?.sessao_id ? sessoesMap.get(alvo.sessao_id) : undefined;
    // Override manual (arrastar no kanban) vence o status derivado do disparo.
    const status = lead.status_crm ?? alvo?.status ?? "nao_disparado";
    return {
      id: lead.id,
      dono: lead.nome,
      empresa: lead.empresa,
      telefone: lead.telefone,
      email: lead.email,
      origem: lead.origem,
      website: lead.website,
      instagram: lead.instagram,
      seguidores: lead.seguidores,
      nota: lead.nota,
      endereco: lead.endereco,
      anunciaGoogle: lead.anuncia_google,
      anunciaMeta: lead.anuncia_meta,
      adsChecando: !!(lead.ads_run_google || lead.ads_run_meta),
      campanha: campanha?.nome ?? null,
      chip: sessao?.nome ?? null,
      status,
    };
  });

  const campanhas: CampanhaOption[] = (campanhasRes.data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome ?? "—",
  }));

  const adsPendentes = items.some((i) => i.adsChecando);

  return (
    <>
      <AutoRefresh ativo={adsPendentes} />
      <StatusView items={items} campanhas={campanhas} planoPago={planoPago} />
    </>
  );
}
