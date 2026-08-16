import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { planoPorId, formatarPreco } from "@/lib/planos";
import { isAdmin } from "@/lib/admin";
import { PACOTES_RECARGA, processarSessaoCheckout } from "@/lib/stripe";
import { RecargaManual } from "@/components/RecargaManual";
import { ComprarCreditos } from "@/components/ComprarCreditos";
import { AssinarPlano } from "@/components/AssinarPlano";

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}
function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtDataHora(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TIPO_LABEL: Record<string, string> = {
  inclusao_plano: "Créditos do plano",
  consumo: "Lead captado",
  recarga: "Recarga",
  ajuste: "Ajuste",
};

export default async function CreditosPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    session_id?: string;
    cancel?: string;
    paid?: string;
  }>;
}) {
  const sp = await searchParams;

  // Processa o retorno do checkout e REDIRECIONA para uma URL limpa.
  // O redirect gera uma nova requisição — assim o topo (layout) relê o saldo
  // já atualizado (senão o badge do topo fica com o valor antigo).
  if (sp.success && sp.session_id) {
    let ok = false;
    try {
      ok = await processarSessaoCheckout(sp.session_id);
    } catch {
      ok = false;
    }
    redirect(`/dashboard/creditos?${ok ? "paid=1" : "cancel=1"}`);
  }

  const pagamentoOk = sp.paid === "1";

  const org = await getActiveOrg();
  if (!org) return null;

  const plano = planoPorId(org.plano);
  const total = org.creditosPlano + org.creditosExtra;

  const supabase = await createClient();
  const { data: transacoes } = await supabase
    .from("creditos_transacoes")
    .select("id, tipo, quantidade, saldo_apos, descricao, criado_em")
    .order("criado_em", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Créditos</h1>
      <p className="mt-1 text-neutral-400">1 crédito = 1 lead captado. Import manual/CSV não gasta.</p>

      {pagamentoOk && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          ✅ Pagamento confirmado! Seus créditos já foram liberados.
        </p>
      )}
      {sp.cancel && (
        <p className="mt-4 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-400">
          Pagamento cancelado — nada foi cobrado.
        </p>
      )}

      {/* Saldo */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
          <p className="text-sm text-amber-200/70">Saldo total</p>
          <p className="mt-1 text-3xl font-bold text-amber-300">⚡ {fmt(total)}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <p className="text-sm text-neutral-400">Do plano (renova todo mês)</p>
          <p className="mt-1 text-2xl font-bold text-white">{fmt(org.creditosPlano)}</p>
          <p className="mt-1 text-xs text-neutral-500">Renova em {fmtData(org.creditosRenovamEm)}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <p className="text-sm text-neutral-400">Extras (recarga, não expiram)</p>
          <p className="mt-1 text-2xl font-bold text-white">{fmt(org.creditosExtra)}</p>
        </div>
      </div>

      {/* Plano + recarga */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <div>
          <p className="text-sm text-neutral-300">
            Plano <strong className="capitalize text-white">{plano.nome}</strong> —{" "}
            {fmt(plano.creditosMes)} créditos/mês
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Precisa de mais? Recarga a {formatarPreco(plano.recargaPreco)}/crédito.
          </p>
        </div>
        <Link
          href="/planos"
          target="_blank"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          Ver planos
        </Link>
      </div>

      {isAdmin(org.email) && (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-5">
          <p className="text-sm font-medium text-white">Recarga manual (admin)</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Enquanto o pagamento automático (Stripe) não entra, adicione créditos na mão.
          </p>
          <div className="mt-3">
            <RecargaManual />
          </div>
        </div>
      )}

      {/* Comprar créditos */}
      <h2 className="mt-8 mb-1 font-medium text-white">Comprar créditos</h2>
      <p className="mb-3 text-sm text-neutral-400">Pacotes avulsos — caem na hora após o pagamento.</p>
      <ComprarCreditos
        packs={PACOTES_RECARGA.map((p) => ({ id: p.id, creditos: p.creditos, preco: p.preco }))}
      />

      {/* Assinar / trocar de plano */}
      <h2 className="mt-8 mb-1 font-medium text-white">Assinar um plano</h2>
      <p className="mb-3 text-sm text-neutral-400">
        Mensalidade com créditos que renovam todo mês + mais recursos.
      </p>
      <AssinarPlano planoAtual={org.plano} />

      {/* Histórico */}
      <h2 className="mt-8 mb-3 font-medium text-white">Histórico</h2>
      {!transacoes || transacoes.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-neutral-400">
          Nenhuma movimentação ainda. Capte leads para ver o consumo aqui.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">Créditos</th>
                <th className="px-4 py-3 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-900/40">
                  <td className="px-4 py-3 text-neutral-400">{fmtDataHora(t.criado_em)}</td>
                  <td className="px-4 py-3 text-neutral-300">{TIPO_LABEL[t.tipo] ?? t.tipo}</td>
                  <td className="px-4 py-3 text-neutral-400">{t.descricao ?? "—"}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      t.quantidade < 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {t.quantidade > 0 ? "+" : ""}
                    {fmt(t.quantidade)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300">{fmt(t.saldo_apos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
