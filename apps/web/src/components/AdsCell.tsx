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

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Google Ads: só afirmamos quando ACHAMOS. Não achar é inconclusivo. */}
      {anunciaGoogle === true ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          ✓ Anuncia no Google
        </span>
      ) : anunciaGoogle === false ? (
        <span
          className="cursor-help rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
          title="Não encontramos anúncios no Google. Pode ser que o comércio NÃO anuncie — ou que a conta de anúncios esteja registrada com outro nome/razão social (bem comum). Vale checar manualmente."
        >
          Google: não localizado ⓘ
        </span>
      ) : null}

      {/* Meta Ads: quando a página exata aparece, confirmamos. Senão, inconclusivo. */}
      {anunciaMeta === true ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          ✓ Anuncia no Meta
        </span>
      ) : anunciaMeta === false ? (
        <span
          className="cursor-help rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
          title="Não localizamos a página exata anunciando no Meta. Pode ser que não anuncie — ou que o nome da página no Facebook/Instagram seja diferente do nome do comércio. Vale conferir na Biblioteca de Anúncios da Meta."
        >
          Meta: não localizado ⓘ
        </span>
      ) : null}

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
