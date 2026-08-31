"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";

// Captura erros não tratados em qualquer rota (fora o root layout, que é
// coberto pelo global-error.tsx). Mostra uma tela nossa, com retry, no lugar
// da tela preta "This page couldn't load" da Vercel.
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-2xl dark:border-neutral-700">
        ⚠️
      </div>
      <div>
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          Não conseguimos carregar esta página. Tente novamente — se continuar,
          recarregue ou fale com o suporte.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Tentar de novo
        </button>
        <a
          href="/dashboard"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Ir para o painel
        </a>
      </div>
    </div>
  );
}
