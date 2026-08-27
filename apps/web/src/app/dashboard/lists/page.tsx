import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewListDialog } from "@/components/NewListDialog";
import { DeleteListButton } from "@/components/DeleteListButton";
import { sourceLabel } from "@/lib/sources";

export default async function ListsPage() {
  const supabase = await createClient();
  const { data: lists } = await supabase
    .from("listas")
    .select("id, nome, origem, criado_em, leads(count)")
    .order("criado_em", { ascending: false });

  const rows = (lists ?? []).map((l) => ({
    ...l,
    leadCount: (l.leads as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Listas de Leads</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Agrupe seus leads por campanha ou origem.</p>
        </div>
        <NewListDialog />
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
          <p className="text-4xl">📋</p>
          <h2 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhuma lista ainda</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Crie sua primeira lista para começar a organizar seus leads.
          </p>
          <div className="mt-5 flex justify-center">
            <NewListDialog />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => (
            <div
              key={l.id}
              className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 transition hover:border-neutral-300"
            >
              <Link href={`/dashboard/lists/${l.id}`} className="block">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{l.nome}</h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{sourceLabel(l.origem)}</p>
                <p className="mt-4 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{l.leadCount}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">leads</p>
              </Link>
              <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100">
                <DeleteListButton id={l.id} name={l.nome} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
