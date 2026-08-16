"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { SEGMENTOS, UFS } from "@/lib/segmentos";
import { estimarQuantidade } from "@/lib/estimativa";
import { salvarInteressado } from "./actions";

type Etapa = "escolha" | "procurando" | "resultado" | "obrigado";

export function DescubraForm() {
  const [etapa, setEtapa] = useState<Etapa>("escolha");
  const [cnae, setCnae] = useState(SEGMENTOS[0].cnae);
  const [uf, setUf] = useState("SP");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);

  const segmentoLabel = SEGMENTOS.find((s) => s.cnae === cnae)?.label ?? "empresas";
  const estimativa = useMemo(() => estimarQuantidade(cnae, uf), [cnae, uf]);

  const passosBusca = [
    "Conectando à base da Receita Federal…",
    `Localizando empresas de ${segmentoLabel} em ${uf}…`,
    "Cruzando sócios e contatos…",
    "Calculando o tamanho do seu mercado…",
  ];

  // Efeito "procurando" — dá vida real antes de revelar o número.
  useEffect(() => {
    if (etapa !== "procurando") return;
    setMsgIdx(0);
    setProgresso(6);
    const msg = setInterval(() => setMsgIdx((i) => Math.min(i + 1, passosBusca.length - 1)), 720);
    const bar = setInterval(() => setProgresso((p) => Math.min(p + 5, 96)), 140);
    const fim = setTimeout(() => setEtapa("resultado"), 3000);
    return () => {
      clearInterval(msg);
      clearInterval(bar);
      clearTimeout(fim);
    };
  }, [etapa]); // eslint-disable-line react-hooks/exhaustive-deps

  if (etapa === "obrigado") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-4 text-xl font-semibold text-neutral-900">Recebemos seus dados!</h2>
        <p className="mt-2 text-neutral-700">
          Em instantes você recebe uma amostra de donos de <strong>{segmentoLabel}</strong> em{" "}
          <strong>{uf}</strong>. Quer já começar a captar sozinho?
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-400"
        >
          Criar conta grátis
        </Link>
      </div>
    );
  }

  if (etapa === "procurando") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-300 border-t-emerald-400" />
          <p className="mt-5 text-sm font-medium text-neutral-900">Procurando donos…</p>
          <p className="mt-1 h-5 text-sm text-neutral-500 transition-all">
            {passosBusca[msgIdx]}
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-150 ease-out"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (etapa === "resultado") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm text-neutral-500">Encontramos aproximadamente</p>
          <p className="my-2 text-5xl font-bold text-emerald-600">
            {estimativa.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-neutral-700">
            donos de <strong>{segmentoLabel}</strong> em <strong>{uf}</strong>
            <span className="ml-1 text-xs text-neutral-500">(estimativa)</span>
          </p>
        </div>

        {/* Teaser borrado dos contatos */}
        <div className="relative mt-6 overflow-hidden rounded-xl border border-neutral-200">
          <div className="space-y-px blur-sm select-none" aria-hidden>
            {["João S. — Restaurante ●●●", "Maria O. — ●●● Alimentos", "Carlos M. — Bar ●●●"].map(
              (t, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-100 px-4 py-3 text-sm">
                  <span className="text-neutral-800">{t}</span>
                  <span className="text-neutral-500">+55 ●● ●●●●-●●●●</span>
                </div>
              ),
            )}
          </div>
          <div className="absolute inset-0 grid place-items-center bg-neutral-100">
            <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700">
              🔒 Contatos bloqueados
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-neutral-900">
          Deixe seu e-mail e telefone para receber uma amostra gratuita 👇
        </p>

        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const input = {
              nome: String(fd.get("nome") ?? ""),
              email: String(fd.get("email") ?? ""),
              telefone: String(fd.get("telefone") ?? ""),
              empresa: String(fd.get("empresa") ?? ""),
              segmento: segmentoLabel,
              uf,
              estimativa,
              hp: String(fd.get("website_url") ?? ""),
            };
            start(async () => {
              const res = await salvarInteressado(input);
              if (!res.ok) return setError(res.error);
              setEtapa("obrigado");
            });
          }}
        >
          {/* honeypot anti-bot (invisível para humanos) */}
          <input
            type="text"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <input name="nome" placeholder="Seu nome" className="input" />
          <input name="empresa" placeholder="Sua empresa" className="input" />
          <input name="email" type="email" required placeholder="E-mail corporativo" className="input" />
          <input name="telefone" required placeholder="WhatsApp / telefone" className="input" />
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {pending ? "Enviando…" : "🔓 Liberar amostra grátis"}
          </button>
          <p className="text-center text-[11px] leading-snug text-neutral-400">
            Ao enviar, você concorda com nossa{" "}
            <Link href="/privacidade" className="underline hover:text-neutral-600">
              Política de Privacidade
            </Link>
            . Usamos seus dados apenas para enviar sua amostra.
          </p>
          <button
            type="button"
            onClick={() => setEtapa("escolha")}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← escolher outro segmento
          </button>
        </form>
      </div>
    );
  }

  // etapa "escolha"
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Segmento</span>
          <select value={cnae} onChange={(e) => setCnae(e.target.value)} className="input">
            {SEGMENTOS.map((s) => (
              <option key={s.cnae} value={s.cnae}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Estado</span>
          <select value={uf} onChange={(e) => setUf(e.target.value)} className="input">
            {UFS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setEtapa("procurando")}
          className="mt-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400"
        >
          Descobrir quantos donos existem →
        </button>
      </div>
    </div>
  );
}
