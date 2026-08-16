import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { StatusView, type StatusItem, type CampanhaOption } from "@/components/StatusView";

export default async function CrmPage() {
  const org = await getActiveOrg();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Status dos disparos</h1>
        <p className="mt-1 text-neutral-400">
          Acompanhe cada lead do disparo — atualiza sozinho.
        </p>
      </div>

      {org ? <CrmContent orgId={org.orgId} /> : <EmptyState />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
      <p className="text-4xl">📡</p>
      <h2 className="mt-3 font-medium text-white">Nenhum disparo ainda</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Crie e dispare uma campanha no Disparador.
      </p>
    </div>
  );
}

async function CrmContent({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const { data: alvos } = await supabase
    .from("campanha_alvos")
    .select("id, campanha_id, lead_id, telefone, sessao_id, status, enviado_em")
    .eq("organizacao_id", orgId)
    .order("enviado_em", { ascending: false, nullsFirst: false });

  const rows = alvos ?? [];

  if (rows.length === 0) {
    return <EmptyState />;
  }

  // JOINS MANUAIS — sem embeds do PostgREST.
  const leadIds = [...new Set(rows.map((r) => r.lead_id).filter((v): v is string => !!v))];
  const campanhaIds = [...new Set(rows.map((r) => r.campanha_id).filter((v): v is string => !!v))];
  const sessaoIds = [...new Set(rows.map((r) => r.sessao_id).filter((v): v is string => !!v))];

  const [leadsRes, campanhasRes, sessoesRes] = await Promise.all([
    leadIds.length
      ? supabase.from("leads").select("id, nome, empresa, telefone").in("id", leadIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null; empresa: string | null; telefone: string | null }[] }),
    campanhaIds.length
      ? supabase.from("campanhas").select("id, nome").in("id", campanhaIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null }[] }),
    sessaoIds.length
      ? supabase.from("sessoes_whatsapp").select("id, nome").in("id", sessaoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null }[] }),
  ]);

  const leadsMap = new Map((leadsRes.data ?? []).map((l) => [l.id, l]));
  const campanhasMap = new Map((campanhasRes.data ?? []).map((c) => [c.id, c]));
  const sessoesMap = new Map((sessoesRes.data ?? []).map((s) => [s.id, s]));

  const items: StatusItem[] = rows.map((r) => {
    const lead = r.lead_id ? leadsMap.get(r.lead_id) : undefined;
    const campanha = r.campanha_id ? campanhasMap.get(r.campanha_id) : undefined;
    const sessao = r.sessao_id ? sessoesMap.get(r.sessao_id) : undefined;
    return {
      id: r.id,
      dono: lead?.nome ?? null,
      empresa: lead?.empresa ?? null,
      telefone: r.telefone ?? lead?.telefone ?? null,
      campanha: campanha?.nome ?? null,
      chip: sessao?.nome ?? null,
      status: r.status ?? "pendente",
    };
  });

  const campanhas: CampanhaOption[] = (campanhasRes.data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome ?? "—",
  }));

  return <StatusView items={items} campanhas={campanhas} />;
}
