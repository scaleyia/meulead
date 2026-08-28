"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { verificarAnuncios } from "@/app/dashboard/crm/actions";
import { UpgradeDialog } from "@/components/UpgradeDialog";

// Mostra os selos de anúncios (Google/Meta) e o botão de verificar sob demanda.
// `planoPago` = recurso liberado. No grátis o botão continua clicável, mas o
// clique abre o popup de upgrade em vez de rodar a verificação.
export function AdsCell({
  leadId,
  anunciaGoogle,
  anunciaMeta,
  checando,
  planoPago,
  plano,
}: {
  leadId: string;
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  checando: boolean;
  planoPago: boolean;
  plano: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [upgrade, setUpgrade] = useState(false);

  function disparar() {
    if (!planoPago) {
      setUpgrade(true);
      return;
    }
    start(async () => {
      await verificarAnuncios(leadId);
      router.refresh();
    });
  }

  const conteudo = renderConteudo();

  return (
    <>
      {conteudo}
      {upgrade && <UpgradeModal plano={plano} onClose={() => setUpgrade(false)} />}
    </>
  );

  function renderConteudo() {
    if (checando || pending) {
      return <span className="text-xs text-neutral-400 dark:text-neutral-500">verificando…</span>;
    }

    const verificado = anunciaGoogle !== null || anunciaMeta !== null;

    if (!verificado) {
      return (
        <button
          onClick={disparar}
          className="whitespace-nowrap rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          🔎 verificar
        </button>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-1">
        {anunciaGoogle === true ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            ✓ Anuncia no Google
          </span>
        ) : anunciaGoogle === false ? (
          <span
            className="cursor-help rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
            title="Não encontramos anúncios no Google. Pode ser que o comércio NÃO anuncie — ou que a conta de anúncios esteja registrada com outro nome/razão social (bem comum). Vale checar manualmente."
          >
            Google: não localizado ⓘ
          </span>
        ) : null}

        {anunciaMeta === true ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            ✓ Anuncia no Meta
          </span>
        ) : anunciaMeta === false ? (
          <span
            className="cursor-help rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
            title="Não localizamos a página exata anunciando no Meta. Pode ser que não anuncie — ou que o nome da página no Facebook/Instagram seja diferente do nome do comércio. Vale conferir na Biblioteca de Anúncios da Meta."
          >
            Meta: não localizado ⓘ
          </span>
        ) : null}

        <button
          onClick={disparar}
          className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
          title="Verificar de novo"
        >
          ↻
        </button>
      </div>
    );
  }
}

function UpgradeModal({ plano, onClose }: { plano: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/20 p-4"
      onClick={onClose}
    >
      <div
        className="anim-in w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          🔒
        </div>
        <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recurso do plano pago</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          A verificação de anúncios no <strong>Google</strong> e no <strong>Meta</strong> está
          disponível a partir dos planos pagos. Faça o upgrade para descobrir quais leads já
          investem em tráfego — os clientes mais quentes.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <UpgradeDialog
            planoAtual={plano}
            className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
          >
            Ver planos e fazer upgrade
          </UpgradeDialog>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
