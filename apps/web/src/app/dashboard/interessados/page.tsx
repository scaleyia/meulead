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
        <p className="mt-1 text-neutral-500">
          Leads capturados na landing pública (
          <a href="/descubra" target="_blank" className="text-emerald-600 hover:underline">
            /descubra
          </a>
          ) — seus próprios prospects de venda.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-4xl">🧲</p>
          <h2 className="mt-3 font-medium text-neutral-900">Nenhum interessado ainda</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Rode tráfego para a landing <strong>/descubra</strong> — cada visitante que deixar o
            contato aparece aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Interesse</th>
                <th className="px-4 py-3 font-medium">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rows.map((i) => (
                <tr key={i.id} className="hover:bg-neutral-100">
                  <td className="px-4 py-3 text-neutral-900">{i.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.email}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {i.segmento ?? "—"}
                    {i.uf ? ` · ${i.uf}` : ""}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatarData(i.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
