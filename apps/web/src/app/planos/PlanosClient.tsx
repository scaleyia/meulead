"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PLANOS,
  formatarPreco,
  formatarBRL,
  precoAnual,
  DESCONTO_ANUAL,
} from "@/lib/planos";

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

export default function PlanosClient() {
  const [ciclo, setCiclo] = useState<Ciclo>("anual");
  const descontoPct = Math.round(DESCONTO_ANUAL * 100);

  return (
    <>
      {/* Toggle Mensal / Anual */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCiclo("mensal")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              ciclo === "mensal"
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setCiclo("anual")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              ciclo === "anual"
                ? "bg-blue-600 text-white"
                : "text-neutral-500 hover:text-neutral-900"
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

      <div className="mt-12 grid items-start gap-5 text-left lg:grid-cols-4">
        {PLANOS.map((p) => {
          const anual = precoAnual(p.preco);
          const pago = p.preco > 0;
          const pop = !!p.destaque;
          return (
            <div
              key={p.id}
              className={`relative flex h-full flex-col rounded-3xl p-7 transition ${
                pop
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 lg:-my-3 lg:py-10"
                  : "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:shadow-md"
              }`}
            >
              {pop && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-xs font-bold text-blue-700 shadow-md">
                  Mais popular
                </span>
              )}

              <div className="min-h-[56px]">
                <h2 className={`text-lg font-bold ${pop ? "text-white" : "text-neutral-900"}`}>
                  {p.nome}
                </h2>
                <p className={`mt-0.5 text-sm ${pop ? "text-blue-100" : "text-neutral-500"}`}>
                  {p.resumo}
                </p>
              </div>

              {/* Preço */}
              <div className="mt-5 min-h-[104px]">
                {!pago ? (
                  <span className={`text-4xl font-extrabold tracking-tight ${pop ? "text-white" : "text-neutral-900"}`}>
                    Grátis
                  </span>
                ) : ciclo === "mensal" ? (
                  <>
                    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                      <span className={`text-4xl font-extrabold tracking-tight ${pop ? "text-white" : "text-neutral-900"}`}>
                        {formatarPreco(p.preco)}
                      </span>
                      <span className={`text-sm font-medium ${pop ? "text-blue-100" : "text-neutral-500"}`}>
                        /mês
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${pop ? "text-blue-100" : "text-neutral-500"}`}>
                      cobrado mensalmente
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${pop ? "text-blue-200" : "text-neutral-400"}`}>
                        12x
                      </span>
                      <span className={`text-[1.9rem] font-extrabold leading-none tracking-tight ${pop ? "text-white" : "text-neutral-900"}`}>
                        {formatarBRL(anual.parcela)}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${pop ? "text-blue-100" : "text-neutral-500"}`}>
                      ou {formatarBRL(anual.aVista)} à vista no Pix
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

              {/* CTA — logo abaixo do preço, igual à referência */}
              <Link
                href="/signup"
                className={`mt-6 rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
                  pop
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {p.preco === 0 ? "Começar grátis" : `Escolher ${p.nome}`}
              </Link>

              <ul className="mt-7 space-y-3 text-sm">
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <Check pop={pop} />
                    <span className={`leading-snug ${pop ? "text-blue-50" : "text-neutral-700"}`}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
