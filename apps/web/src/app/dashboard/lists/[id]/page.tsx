import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { enriquecerDonos, donosPendentes } from "@/lib/captura";
import { LeadsTable } from "@/components/LeadsTable";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { ImportCsvDialog } from "@/components/ImportCsvDialog";
import { AutoRefresh } from "@/components/AutoRefresh";
import { sourceLabel } from "@/lib/sources";

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Enriquece o dono em segundo plano (roda também aqui).
  const org = await getActiveOrg();
  let donosFaltando = 0;
  if (org) {
    try {
      await enriquecerDonos(org.orgId);
      donosFaltando = await donosPendentes(org.orgId);
    } catch {
      /* segue carregando */
    }
  }

  const { data: list } = await supabase
    .from("listas")
    .select("id, nome, origem")
    .eq("id", id)
    .maybeSingle();

  if (!list) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, nome, empresa, telefone, email, origem, website, instagram, seguidores, nota, total_avaliacoes, endereco, criado_em",
    )
    .eq("lista_id", id)
    .order("criado_em", { ascending: false });

  return (
    <div>
      <AutoRefresh ativo={donosFaltando > 0} />
      <Link href="/dashboard/lists" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Listas
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{list.nome}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sourceLabel(list.origem)} · {leads?.length ?? 0} leads
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCsvDialog listId={id} />
          <AddLeadDialog listId={id} />
        </div>
      </div>

      <div className="mt-6">
        <LeadsTable listId={id} leads={leads ?? []} />
      </div>
    </div>
  );
}
