"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";
import { logout } from "../(auth)/actions";

// Erro dentro do painel logado. Além do retry, oferece "Sair" — muitos erros
// aqui vêm de sessão/organização inconsistente, e sair limpa a sessão.
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-neutral-800 dark:text-neutral-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-2xl dark:border-neutral-700">
        ⚠️
      </div>
      <div>
        <h1 className="text-xl font-semibold">Não conseguimos carregar o painel</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          Tente novamente. Se o erro continuar, saia e entre de novo para
          renovar sua sessão.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Tentar de novo
        </button>
        <form action={logout}>
          <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
