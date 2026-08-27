"use client";

import { useState, useTransition } from "react";
import { iniciarCheckoutRecarga } from "@/app/dashboard/creditos/actions";

interface Pack {
  id: string;
  creditos: number;
  preco: number;
}

export function ComprarCreditos({ packs }: { packs: Pack[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function comprar(id: string) {
    setError(null);
    setPendingId(id);
    start(async () => {
      const res = await iniciarCheckoutRecarga(id);
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
        {packs.map((p) => (
          <button
            key={p.id}
            disabled={pendingId !== null}
            onClick={() => comprar(p.id)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-left transition hover:border-amber-500/40 disabled:opacity-60"
          >
            <p className="text-2xl font-bold text-amber-600">⚡ {p.creditos.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">créditos</p>
            <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </p>
            <span className="mt-2 inline-block text-xs text-emerald-600 dark:text-emerald-400">
              {pendingId === p.id ? "Abrindo checkout…" : "Comprar →"}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
