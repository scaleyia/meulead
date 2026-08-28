"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  PLANOS,
  formatarPreco,
  formatarBRL,
  precoAnual,
  DESCONTO_ANUAL,
} from "@/lib/planos";
import { iniciarCheckoutAssinatura } from "@/app/dashboard/creditos/actions";

type Ciclo = "mensal" | "anual";

function Check({ pop }: { pop: boolean }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${pop ? "text-white" : "text-green-500"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function UpgradeDialog({
  planoAtual,
  className,
  children,
}: {
  planoAtual: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <Modal planoAtual={planoAtual} onClose={() => setOpen(false)} />}
    </>
  );
}

function Modal({ planoAtual, onClose }: { planoAtual: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [ciclo, setCiclo] = useState<Ciclo>("anual");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const descontoPct = Math.round(DESCONTO_ANUAL * 100);

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

  function assinar(id: string) {
    setError(null);
    setPendingId(id);
    start(async () => {
      const res = await iniciarCheckoutAssinatura(id, ciclo);
      if (!res.ok) {
        setError(res.error);
        setPendingId(null);
        return;
      }
      window.location.href = res.url;
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/40 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="anim-in my-auto w-full max-w-6xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-8 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              Escolha seu plano
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Mais leads, mais números e mais disparos. Troque de plano quando quiser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Toggle Mensal / Anual */}
        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setCiclo("mensal")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                ciclo === "mensal"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setCiclo("anual")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                ciclo === "anual" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Anual
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  ciclo === "anual" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                }`}
              >
                -{descontoPct}%
              </span>
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-500/10">
            {error}
          </p>
        )}

        {/* Cards */}
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANOS.map((p) => {
            const anual = precoAnual(p.preco);
            const pago = p.preco > 0;
            const pop = !!p.destaque;
            const atual = planoAtual === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex h-full flex-col rounded-3xl p-6 transition ${
                  pop
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/25"
                    : "border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                }`}
              >
                {pop && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-md">
                    Mais popular
                  </span>
                )}

                <div className="min-h-[52px]">
                  <h3 className={`text-base font-bold ${pop ? "text-white" : "text-neutral-900 dark:text-neutral-100"}`}>
                    {p.nome}
                  </h3>
                  <p className={`mt-0.5 text-xs ${pop ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {p.resumo}
                  </p>
                </div>

                {/* Preço */}
                <div className="mt-4 min-h-[92px]">
                  {!pago ? (
                    <span className={`text-3xl font-extrabold tracking-tight ${pop ? "text-white" : "text-neutral-900 dark:text-neutral-100"}`}>
                      Grátis
                    </span>
                  ) : ciclo === "mensal" ? (
                    <>
                      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className={`text-3xl font-extrabold tracking-tight ${pop ? "text-white" : "text-neutral-900 dark:text-neutral-100"}`}>
                          {formatarPreco(p.preco)}
                        </span>
                        <span className={`text-sm font-medium ${pop ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                          /mês
                        </span>
                      </div>
                      <p className={`mt-2 text-xs ${pop ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                        cobrado mensalmente
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className={`text-3xl font-extrabold tracking-tight ${pop ? "text-white" : "text-neutral-900 dark:text-neutral-100"}`}>
                          {formatarBRL(anual.parcela)}
                        </span>
                        <span className={`text-sm font-medium ${pop ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                          /mês
                        </span>
                      </div>
                      <p className={`mt-2 text-xs ${pop ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                        {formatarBRL(anual.aVista)} à vista/ano · pagamento único (cartão ou Pix)
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          pop ? "bg-white/15 text-white" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Economize {formatarBRL(anual.economia)}/ano
                      </span>
                    </>
                  )}
                </div>

                {/* CTA */}
                {atual ? (
                  <span className={`mt-5 rounded-full border px-4 py-2.5 text-center text-sm font-semibold ${
                    pop ? "border-white/40 text-white" : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                  }`}>
                    Plano atual
                  </span>
                ) : !pago ? (
                  <span className="mt-5 rounded-full border border-neutral-300 px-4 py-2.5 text-center text-sm font-semibold text-neutral-400 dark:border-neutral-700">
                    Plano gratuito
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={pendingId !== null}
                    onClick={() => assinar(p.id)}
                    className={`mt-5 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition disabled:opacity-60 ${
                      pop
                        ? "bg-white text-blue-700 hover:bg-blue-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {pendingId === p.id ? "Abrindo…" : `Escolher ${p.nome}`}
                  </button>
                )}

                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2.5">
                      <Check pop={pop} />
                      <span className={`leading-snug ${pop ? "text-blue-50" : "text-neutral-600 dark:text-neutral-300"}`}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Pagamento seguro via Stripe. Os créditos e recursos liberam assim que o pagamento é confirmado.
          <br />
          Sem fidelidade: no plano mensal você cancela quando quiser em <strong>Créditos → Assinatura</strong>.
        </p>
      </div>
    </div>,
    document.body,
  );
}
