import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { isAdmin } from "@/lib/admin";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function InteressadosPage() {
  const org = await getActiveOrg();
  if (!isAdmin(org?.email)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: interessados } = await supabase
    .from("interessados")
    .select("id, nome, email, telefone, empresa, segmento, uf, estimativa, criado_em")
    .order("criado_em", { ascending: false });

  const rows = interessados ?? [];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Interessados</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Leads capturados na landing pública (
          <a href="/descubra" target="_blank" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            /descubra
          </a>
          ) — seus próprios prospects de venda.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
          <p className="text-4xl">🧲</p>
          <h2 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhum interessado ainda</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Rode tráfego para a landing <strong>/descubra</strong> — cada visitante que deixar o
            contato aparece aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Interesse</th>
                <th className="px-4 py-3 font-medium">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((i) => (
                <tr key={i.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">{i.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{i.email}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{i.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{i.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {i.segmento ?? "—"}
                    {i.uf ? ` · ${i.uf}` : ""}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{formatarData(i.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
