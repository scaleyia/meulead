"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { deleteLead } from "@/app/dashboard/lists/[id]/actions";
import { createPortal } from "react-dom";
import { validarWhatsapp, removerSemWhatsapp, enviarParaCrm } from "@/app/dashboard/leads/actions";
import { sourceLabel } from "@/lib/sources";
import { AdsCell } from "@/components/AdsCell";
import { SiteCell } from "@/components/SiteCell";
import { InstagramLeadCard } from "@/components/InstagramLeadCard";

export interface AllLeadRow {
  id: string;
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  origem: string;
  website: string | null;
  instagram: string | null;
  seguidores: number | null;
  nota: number | null;
  total_avaliacoes: number | null;
  endereco: string | null;
  categoria: string | null;
  fotoPerfil: string | null;
  bio: string | null;
  verificado: boolean | null;
  posts: number | null;
  temWhatsapp: boolean | null;
  siteScore: number | null;
  siteAnalisado: boolean;
  lista_id: string | null;
  listaNome: string | null;
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  adsChecando: boolean;
  noCrm: boolean;
}

type Fonte = "google_maps" | "instagram";

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

function temSite(l: AllLeadRow): boolean {
  return !!(l.website && l.website.trim());
}

type Filtro = "todos" | "sem_site" | "com_site";

export function AllLeadsTable({
  leads,
  listas,
  planoPago,
}: {
  leads: AllLeadRow[];
  listas: ListaOption[];
  planoPago: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [fonte, setFonte] = useState<Fonte>("google_maps");
  const [listaId, setListaId] = useState<string>("todas");
  const [pending, start] = useTransition();
  const [validando, startValidar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Feedback otimista pros leads enviados ao CRM nesta sessão.
  const [enviadosCrm, setEnviadosCrm] = useState<Set<string>>(new Set());
  const [crmPendingId, setCrmPendingId] = useState<string | null>(null);

  function enviarCrm(id: string) {
    setCrmPendingId(id);
    start(async () => {
      const res = await enviarParaCrm(id);
      setCrmPendingId(null);
      if (res.ok) {
        setEnviadosCrm((prev) => new Set(prev).add(id));
        router.refresh();
      } else {
        setAviso(res.error ?? "Falha ao enviar para o CRM.");
      }
    });
  }

  function validar() {
    setAviso(null);
    startValidar(async () => {
      const res = await validarWhatsapp(listaId === "todas" ? null : listaId);
      router.refresh();
      if (!res.ok) return setAviso(res.error ?? "Falha ao validar.");
      if ((res.checados ?? 0) === 0)
        return setAviso("Nada novo pra validar (todos já checados).");
      const sem = res.semWhats ?? 0;
      setAviso(`Validados ${res.checados} — ${res.comWhats} com WhatsApp, ${sem} sem.`);
      if (sem > 0) setConfirmar(sem); // abre o popup de exclusão
    });
  }

  function confirmarRemocao() {
    setConfirmar(null);
    startValidar(async () => {
      const res = await removerSemWhatsapp(listaId === "todas" ? null : listaId);
      router.refresh();
      if (!res.ok) return setAviso(res.error ?? "Falha ao remover.");
      setAviso(
        `${res.removidos} lead(s) sem WhatsApp removido(s) · ${res.removidos} crédito(s) estornado(s).`,
      );
    });
  }

  const totGoogle = useMemo(() => leads.filter((l) => l.origem === "google_maps").length, [leads]);
  const totInsta = useMemo(() => leads.filter((l) => l.origem === "instagram").length, [leads]);

  const base = useMemo(
    () =>
      leads.filter((l) => {
        if (listaId !== "todas" && l.lista_id !== listaId) return false;
        if (l.origem !== fonte) return false;
        return true;
      }),
    [leads, listaId, fonte],
  );

  const semSiteCount = useMemo(() => base.filter((l) => !temSite(l)).length, [base]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return base.filter((l) => {
      if (filtro === "sem_site" && temSite(l)) return false;
      if (filtro === "com_site" && !temSite(l)) return false;
      if (!term) return true;
      return [l.nome, l.empresa, l.telefone, l.email, l.website].some((v) =>
        v?.toLowerCase().includes(term),
      );
    });
  }, [q, filtro, base]);

  function remove(id: string, listaIdDoLead: string | null) {
    if (!confirm("Excluir este lead?")) return;
    start(async () => {
      await deleteLead(id, listaIdDoLead ?? "");
      router.refresh();
    });
  }

  function exportarCsv() {
    const cols = [
      "Empresa", "Dono", "Telefone", "Email", "Site", "Nota", "Avaliacoes",
      "Instagram", "Seguidores", "Categoria", "Endereco", "Lista", "Origem",
      "Anuncia Google", "Anuncia Meta",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const bool = (b: boolean | null) => (b === null ? "" : b ? "sim" : "nao");
    const linhas = filtered.map((l) =>
      [
        l.empresa, l.nome, l.telefone, l.email, l.website, l.nota, l.total_avaliacoes,
        l.instagram, l.seguidores, l.categoria, l.endereco, l.listaNome, l.origem,
        bool(l.anunciaGoogle), bool(l.anunciaMeta),
      ]
        .map(esc)
        .join(","),
    );
    // BOM p/ o Excel abrir acentos certo.
    const csv = "﻿" + [cols.join(","), ...linhas].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${fonte}-${filtered.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (leads.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
        <p className="text-4xl">🗂️</p>
        <h2 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhum lead ainda</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Capte leads na <strong>Captação</strong> — eles aparecem aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, empresa, telefone, e-mail ou site…"
          className="input max-w-xs"
        />
        {/* Filtro por FONTE da captação */}
        <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm">
          {(
            [
              { key: "google_maps", label: `🗺️ Google Maps (${totGoogle})` },
              { key: "instagram", label: `📸 Instagram (${totInsta})` },
            ] as { key: Fonte; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFonte(f.key)}
              className={`px-3 py-2 font-medium transition ${
                fonte === f.key
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
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
        <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm">
          {(
            [
              { key: "todos", label: "Todos" },
              { key: "sem_site", label: `Sem site (${semSiteCount})` },
              { key: "com_site", label: "Com site" },
            ] as { key: Filtro; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-2 font-medium transition ${
                filtro === f.key
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {fonte === "google_maps" && (
          <button
            onClick={validar}
            disabled={validando}
            title="Verifica quais números têm WhatsApp antes de disparar (economiza chip)"
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe5b] disabled:opacity-60"
          >
            {validando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4 fill-white" />
            )}
            {validando ? "Validando…" : "Validar WhatsApp"}
          </button>
        )}
        <button
          onClick={exportarCsv}
          disabled={filtered.length === 0}
          className={`${fonte === "google_maps" ? "" : "ml-auto"} rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 transition hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40`}
        >
          ⬇ Exportar CSV
        </button>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {filtered.length} de {leads.length} leads
        </span>
      </div>
      {aviso && (
        <p className="mb-3 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">{aviso}</p>
      )}

      {fonte === "instagram" ? (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum perfil do Instagram nesse filtro.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <InstagramLeadCard
                key={l.id}
                lead={l}
                onExcluir={() => remove(l.id, l.lista_id)}
                excluindo={pending}
                onEnviarCrm={() => enviarCrm(l.id)}
                noCrm={l.noCrm || enviadosCrm.has(l.id)}
                enviandoCrm={crmPendingId === l.id}
              />
            ))}
          </div>
        )
      ) : (
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa / Dono</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Nota</th>
              <th className="px-4 py-3 font-medium">Anúncios</th>
              <th className="px-4 py-3 font-medium">Lista</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filtered.map((l) => (
              <tr key={l.id} className="align-top hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{l.empresa ?? l.nome ?? "—"}</p>
                  {l.nome && l.empresa && (
                    <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">👤 {l.nome}</p>
                  )}
                  {l.endereco && <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{l.endereco}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-700 dark:text-neutral-200">
                  <span className="tabular-nums">{formatarTelefone(l.telefone)}</span>
                  {l.temWhatsapp === true && (
                    <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      ✓ zap
                    </span>
                  )}
                  {l.temWhatsapp === false && (
                    <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                      sem zap
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SiteCell
                    leadId={l.id}
                    website={l.website}
                    siteScore={l.siteScore}
                    siteAnalisado={l.siteAnalisado}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-700 dark:text-neutral-200">
                  {l.nota != null ? (
                    <span>
                      <span className="font-medium">{l.nota.toFixed(1)}</span>
                      <span className="text-amber-500"> ★</span>
                      {l.total_avaliacoes != null && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500"> ({l.total_avaliacoes})</span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <AdsCell
                    leadId={l.id}
                    anunciaGoogle={l.anunciaGoogle}
                    anunciaMeta={l.anunciaMeta}
                    checando={l.adsChecando}
                    planoPago={planoPago}
                  />
                </td>
                <td className="px-4 py-3">
                  {l.lista_id ? (
                    <Link
                      href={`/dashboard/lists/${l.lista_id}`}
                      className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
                    >
                      {l.listaNome ?? "lista"}
                    </Link>
                  ) : (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {sourceLabel(l.origem)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {l.noCrm || enviadosCrm.has(l.id) ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-600 dark:text-blue-400">
                        ✓ no CRM
                      </span>
                    ) : (
                      <button
                        onClick={() => enviarCrm(l.id)}
                        disabled={crmPendingId === l.id}
                        title="Enviar este lead para o CRM"
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-500/20 disabled:opacity-60 dark:text-blue-300"
                      >
                        {crmPendingId === l.id ? "enviando…" : "→ CRM"}
                      </button>
                    )}
                    <button
                      onClick={() => remove(l.id, l.lista_id)}
                      disabled={pending}
                      className="whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-600"
                    >
                      excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum lead corresponde ao filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {mounted &&
        confirmar !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/20 p-4"
            onClick={() => setConfirmar(null)}
          >
            <div
              className="anim-in w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Excluir leads sem WhatsApp?
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                <strong>{confirmar}</strong> {confirmar === 1 ? "lead não tem" : "leads não têm"}{" "}
                WhatsApp e não {confirmar === 1 ? "serve" : "servem"} pra disparo. Se excluir,{" "}
                <strong>
                  {confirmar} crédito{confirmar === 1 ? "" : "s"}
                </strong>{" "}
                {confirmar === 1 ? "volta" : "voltam"} pra sua conta.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmar(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Manter
                </button>
                <button
                  onClick={confirmarRemocao}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
                >
                  Excluir e estornar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
