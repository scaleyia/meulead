"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verificarAnuncios } from "@/app/dashboard/crm/actions";

// Mostra os selos de anúncios (Google/Meta) e o botão de verificar sob demanda.
export function AdsCell({
  leadId,
  anunciaGoogle,
  anunciaMeta,
  checando,
}: {
  leadId: string;
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  checando: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (checando || pending) {
    return <span className="text-xs text-neutral-400">verificando…</span>;
  }

  const verificado = anunciaGoogle !== null || anunciaMeta !== null;

  if (!verificado) {
    return (
      <button
        onClick={() =>
          start(async () => {
            await verificarAnuncios(leadId);
            router.refresh();
          })
        }
        className="whitespace-nowrap rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
      >
        🔎 verificar
      </button>
    );
  }

  const nenhum = !anunciaGoogle && !anunciaMeta;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {anunciaGoogle && (
        <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600">
          Google Ads
        </span>
      )}
      {anunciaMeta && (
        <span className="rounded-md bg-fuchsia-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-fuchsia-600">
          Meta Ads
        </span>
      )}
      {nenhum && <span className="text-xs text-neutral-400">não anuncia</span>}
      <button
        onClick={() =>
          start(async () => {
            await verificarAnuncios(leadId);
            router.refresh();
          })
        }
        className="text-[11px] text-neutral-400 hover:text-neutral-700"
        title="Verificar de novo"
      >
        ↻
      </button>
    </div>
  );
}
