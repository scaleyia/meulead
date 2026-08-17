import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { calcularScore } from "@/lib/score";
import { OportunidadesView, type OportunidadeRow } from "@/components/OportunidadesView";

export default async function OportunidadesPage() {
  const org = await getActiveOrg();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Oportunidades</h1>
        <p className="mt-1 text-neutral-500">
          Seus leads ranqueados por potencial de venda — quem <strong>já investe</strong> e{" "}
          <strong>precisa de ajuda</strong> (sem site) aparece no topo.
        </p>
      </div>

      {org ? <Conteudo orgId={org.orgId} /> : null}
    </div>
  );
}

async function Conteudo({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, empresa, nome, telefone, website, endereco, origem, nota, total_avaliacoes, seguidores, anuncia_google, anuncia_meta",
    )
    .eq("organizacao_id", orgId)
    // Instagram não entra: sem telefone e sem os sinais de qualificação (site/nota).
    .eq("origem", "google_maps")
    .order("criado_em", { ascending: false });

  const rows: OportunidadeRow[] = (leads ?? []).map((l) => {
    const s = calcularScore({
      website: l.website,
      anunciaGoogle: l.anuncia_google,
      anunciaMeta: l.anuncia_meta,
      nota: l.nota,
      totalAvaliacoes: l.total_avaliacoes,
      telefone: l.telefone,
      seguidores: l.seguidores,
    });
    return {
      id: l.id,
      empresa: l.empresa,
      nome: l.nome,
      telefone: l.telefone,
      website: l.website,
      endereco: l.endereco,
      origem: l.origem,
      score: s.valor,
      nivel: s.nivel,
      motivos: s.motivos,
    };
  });

  return <OportunidadesView leads={rows} />;
}
