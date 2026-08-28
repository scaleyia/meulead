"use client";

import { useState, useTransition } from "react";
import { abrirPortalAssinatura } from "@/app/dashboard/creditos/actions";

// Botão que abre o Portal do Cliente do Stripe (gerenciar cartão / cancelar).
export function GerenciarAssinatura({ className }: { className?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setError(null);
    start(async () => {
      const res = await abrirPortalAssinatura();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={abrir}
        disabled={pending}
        className={
          className ??
          "rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        }
      >
        {pending ? "Abrindo…" : "Gerenciar ou cancelar assinatura"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
