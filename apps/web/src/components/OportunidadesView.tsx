"use client";

import { useMemo, useState } from "react";
import { NIVEL_INFO, type Nivel } from "@/lib/score";

export interface OportunidadeRow {
  id: string;
  empresa: string | null;
  nome: string | null;
  telefone: string | null;
  website: string | null;
  endereco: string | null;
  origem: string;
  nota: number | null;
  totalAvaliacoes: number | null;
  siteScore: number | null;
  temWhatsapp: boolean | null;
  lista_id: string | null;
  listaNome: string | null;
  score: number;
  nivel: Nivel;
  motivos: string[];
}

export interface ListaOption {
  id: string;
  nome: string;
}

function formatarTelefone(raw: string | null): string {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  const nac = d.startsWith("55") ? d.slice(2) : d;
  if (nac.length === 11) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 7)}-${nac.slice(7)}`;
  if (nac.length === 10) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 6)}-${nac.slice(6)}`;
  return raw;
}
function wa(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}
function temSite(l: OportunidadeRow) {
  return !!(l.website && l.website.trim());
}

type Filtro = "todos" | Nivel;

export function OportunidadesView({
  leads,
  listas,
}: {
  leads: OportunidadeRow[];
  listas: ListaOption[];
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [listaId, setListaId] = useState("todas");
  const [q, setQ] = useState("");

  const base = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (listaId !== "todas" && l.lista_id !== listaId) return false;
      if (!term) return true;
      return [l.empresa, l.nome, l.telefone, l.endereco].some((v) =>
        v?.toLowerCase().includes(term),
      );
    });
  }, [leads, listaId, q]);

  const counts = useMemo(() => {
    const c = { quente: 0, morno: 0, frio: 0 };
    for (const l of base) c[l.nivel]++;
    return c;
  }, [base]);

  const lista = useMemo(() => {
    const arr = filtro === "todos" ? base : base.filter((l) => l.nivel === filtro);
    return [...arr].sort((a, b) => b.score - a.score);
  }, [base, filtro]);

  return (
    <div className="mt-6">
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar empresa, dono, telefone…"
          className="input max-w-xs"
        />
        <select
          value={listaId}
          onChange={(e) => setListaId(e.target.value)}
          className="input max-w-xs"
        >
          <option value="todas">Todas as listas</option>
          {listas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-neutral-200 p-1 text-sm">
          {(
            [
              { key: "todos", label: `Todos (${base.length})` },
              { key: "quente", label: `🔥 Quentes (${counts.quente})` },
              { key: "morno", label: `🟡 Mornos (${counts.morno})` },
              { key: "frio", label: `🔵 Frios (${counts.frio})` },
            ] as { key: Filtro; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filtro === f.key
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {counts.quente > 0 && filtro === "todos" && (
        <p className="mb-3 text-sm text-neutral-500">
          🔥 <strong className="text-neutral-800">{counts.quente}</strong> leads quentes prontos pra
          abordar.
        </p>
      )}

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-sm text-neutral-500">
          Nenhuma oportunidade nesse filtro. Capte leads (e valide WhatsApp / analise sites) para
          ranquear melhor.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {lista.map((l) => (
            <div
              key={l.id}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-900">
                    {l.empresa ?? l.nome ?? "—"}
                  </p>
                  {l.nome && l.empresa && (
                    <p className="text-xs font-medium text-emerald-700">👤 {l.nome}</p>
                  )}
                  {l.endereco && <p className="truncate text-xs text-neutral-400">{l.endereco}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${NIVEL_INFO[l.nivel].classe}`}
                  >
                    {NIVEL_INFO[l.nivel].label}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    score <strong className="text-neutral-600">{l.score}</strong>
                  </span>
                </div>
              </div>

              {/* Motivos (por que é oportunidade) */}
              <div className="mt-3 flex flex-wrap gap-1">
                {l.motivos.map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600"
                  >
                    {m}
                  </span>
                ))}
                {l.nota != null && (
                  <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                    {l.nota.toFixed(1)} ★
                  </span>
                )}
              </div>

              {/* Rodapé: contato + ações */}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-sm">
                <span className="tabular-nums text-neutral-700">
                  {formatarTelefone(l.telefone)}
                  {l.temWhatsapp === true && (
                    <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                      ✓ zap
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {!temSite(l) ? (
                    <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">
                      SEM SITE
                    </span>
                  ) : l.siteScore != null && l.siteScore < 60 ? (
                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">
                      site fraco · {l.siteScore}
                    </span>
                  ) : null}
                  {wa(l.telefone) && (
                    <a
                      href={`https://wa.me/${wa(l.telefone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-400"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
