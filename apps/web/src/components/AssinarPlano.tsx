"use client";

import { useState, useTransition } from "react";
import { PLANOS, formatarPreco } from "@/lib/planos";
import { iniciarCheckoutAssinatura } from "@/app/dashboard/creditos/actions";

export function AssinarPlano({ planoAtual }: { planoAtual: string }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pagos = PLANOS.filter((p) => p.preco > 0);

  function assinar(id: string) {
    setError(null);
    setPendingId(id);
    start(async () => {
      const res = await iniciarCheckoutAssinatura(id);
      if (!res.ok) {
        setError(res.error);
        setPendingId(null);
        return;
      }
      window.location.href = res.url;
    });
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {pagos.map((p) => {
          const atual = planoAtual === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${
                p.destaque ? "border-emerald-500/40 bg-emerald-500/[0.05]" : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              }`}
            >
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{p.nome}</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatarPreco(p.preco)}
                <span className="text-sm text-neutral-500 dark:text-neutral-400">/mês</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {p.creditosMes.toLocaleString("pt-BR")} créditos/mês
              </p>
              <button
                disabled={atual || pendingId !== null}
                onClick={() => assinar(p.id)}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                  atual
                    ? "cursor-default border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
                }`}
              >
                {atual ? "Plano atual" : pendingId === p.id ? "Abrindo…" : "Assinar"}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
