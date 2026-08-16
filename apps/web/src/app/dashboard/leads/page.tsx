import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
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
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
        >
          + Nova captação
        </Link>
      </div>

      {org ? <LeadsContent orgId={org.orgId} /> : null}
    </div>
  );
}

async function LeadsContent({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const [{ data: leadsData }, { data: listasData }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, nome, empresa, telefone, email, origem, website, instagram, seguidores, nota, total_avaliacoes, endereco, lista_id",
      )
      .eq("organizacao_id", orgId)
      .order("criado_em", { ascending: false }),
    supabase
      .from("listas")
      .select("id, nome")
      .eq("organizacao_id", orgId)
      .order("criado_em", { ascending: false }),
  ]);

  const listas: ListaOption[] = (listasData ?? []).map((l) => ({ id: l.id, nome: l.nome }));
  const nomePorLista = new Map(listas.map((l) => [l.id, l.nome]));

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
    lista_id: l.lista_id,
    listaNome: l.lista_id ? (nomePorLista.get(l.lista_id) ?? null) : null,
  }));

  return <AllLeadsTable leads={leads} listas={listas} />;
}
