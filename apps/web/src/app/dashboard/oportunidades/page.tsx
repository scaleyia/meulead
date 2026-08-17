import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { calcularScore } from "@/lib/score";
import {
  OportunidadesView,
  type OportunidadeRow,
  type ListaOption,
} from "@/components/OportunidadesView";

export default async function OportunidadesPage() {
  const org = await getActiveOrg();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Oportunidades</h1>
        <p className="mt-1 text-neutral-500">
          Seus leads ranqueados por potencial de venda — quem <strong>já investe / tem movimento</strong> e{" "}
          <strong>precisa de ajuda</strong> (sem site ou site fraco) aparece no topo.
        </p>
      </div>

      {org ? <Conteudo orgId={org.orgId} /> : null}
    </div>
  );
}

async function Conteudo({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const [{ data: leads }, { data: listasData }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, empresa, nome, telefone, website, endereco, origem, nota, total_avaliacoes, seguidores, anuncia_google, anuncia_meta, site_score, tem_whatsapp, lista_id",
      )
      .eq("organizacao_id", orgId)
      .eq("origem", "google_maps")
      .order("criado_em", { ascending: false }),
    supabase
      .from("listas")
      .select("id, nome")
      .eq("organizacao_id", orgId)
      .order("criado_em", { ascending: false }),
  ]);

  const listas: ListaOption[] = (listasData ?? []).map((l) => ({ id: l.id, nome: l.nome }));
  const nomePorLista = new Map(listas.map((l) => [l.id, l.nome]));

  const rows: OportunidadeRow[] = (leads ?? []).map((l) => {
    const s = calcularScore({
      website: l.website,
      siteScore: l.site_score,
      anunciaGoogle: l.anuncia_google,
      anunciaMeta: l.anuncia_meta,
      nota: l.nota,
      totalAvaliacoes: l.total_avaliacoes,
      telefone: l.telefone,
      temWhatsapp: l.tem_whatsapp,
      temDono: !!l.nome,
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
      nota: l.nota,
      totalAvaliacoes: l.total_avaliacoes,
      siteScore: l.site_score,
      temWhatsapp: l.tem_whatsapp,
      lista_id: l.lista_id,
      listaNome: l.lista_id ? (nomePorLista.get(l.lista_id) ?? null) : null,
      score: s.valor,
      nivel: s.nivel,
      motivos: s.motivos,
    };
  });

  return <OportunidadesView leads={rows} listas={listas} />;
}
