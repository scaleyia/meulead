import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { resolverAnuncios, enriquecerDonos, donosPendentes } from "@/lib/captura";
import { AutoRefresh } from "@/components/AutoRefresh";
import {
  AllLeadsTable,
  type AllLeadRow,
  type ListaOption,
} from "@/components/AllLeadsTable";

export default async function LeadsPage() {
  const org = await getActiveOrg();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-neutral-500">
            Todos os seus leads numa tabela só — filtre por lista, por site e busque à vontade.
          </p>
        </div>
        <Link
          href="/dashboard/capture"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          + Nova captação
        </Link>
      </div>

      {org ? <LeadsContent orgId={org.orgId} plano={org.plano} /> : null}
    </div>
  );
}

async function LeadsContent({ orgId, plano }: { orgId: string; plano: string }) {
  const planoPago = plano !== "free";
  const supabase = await createClient();

  // Resolve anúncios e enriquece o dono (roda também aqui, não só na Captação).
  let donosFaltando = 0;
  try {
    await resolverAnuncios(orgId);
    await enriquecerDonos(orgId);
    donosFaltando = await donosPendentes(orgId);
  } catch {
    // segue carregando normalmente
  }

  const [{ data: leadsData }, { data: listasData }, { data: alvosData }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, nome, empresa, telefone, email, origem, website, instagram, seguidores, nota, total_avaliacoes, endereco, categoria, foto_perfil, bio, verificado, posts, tem_whatsapp, site_score, site_analisado, lista_id, no_crm, anuncia_google, anuncia_meta, ads_run_google, ads_run_meta",
      )
      .eq("organizacao_id", orgId)
      .order("criado_em", { ascending: false }),
    supabase
      .from("listas")
      .select("id, nome")
      .eq("organizacao_id", orgId)
      .order("criado_em", { ascending: false }),
    // Leads que já receberam disparo — também contam como "no CRM".
    supabase
      .from("campanha_alvos")
      .select("lead_id")
      .eq("organizacao_id", orgId),
  ]);

  const listas: ListaOption[] = (listasData ?? []).map((l) => ({ id: l.id, nome: l.nome }));
  const nomePorLista = new Map(listas.map((l) => [l.id, l.nome]));
  const disparados = new Set((alvosData ?? []).map((a) => a.lead_id).filter(Boolean) as string[]);

  const leads: AllLeadRow[] = (leadsData ?? []).map((l) => ({
    id: l.id,
    nome: l.nome,
    empresa: l.empresa,
    telefone: l.telefone,
    email: l.email,
    origem: l.origem,
    website: l.website,
    instagram: l.instagram,
    seguidores: l.seguidores,
    nota: l.nota,
    total_avaliacoes: l.total_avaliacoes,
    endereco: l.endereco,
    categoria: l.categoria,
    fotoPerfil: l.foto_perfil,
    bio: l.bio,
    verificado: l.verificado,
    posts: l.posts,
    temWhatsapp: l.tem_whatsapp,
    siteScore: l.site_score,
    siteAnalisado: l.site_analisado,
    lista_id: l.lista_id,
    listaNome: l.lista_id ? (nomePorLista.get(l.lista_id) ?? null) : null,
    anunciaGoogle: l.anuncia_google,
    anunciaMeta: l.anuncia_meta,
    adsChecando: !!(l.ads_run_google || l.ads_run_meta),
    noCrm: !!l.no_crm || disparados.has(l.id),
  }));

  const adsPendentes = leads.some((l) => l.adsChecando);

  return (
    <>
      <AutoRefresh ativo={adsPendentes || donosFaltando > 0} />
      {donosFaltando > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          Buscando o nome dos donos das captações recentes… atualiza sozinho (~1-2 min).
        </div>
      )}
      <AllLeadsTable leads={leads} listas={listas} planoPago={planoPago} plano={plano} />
    </>
  );
}
