"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/dashboard/lists/[id]/actions";
import { sourceLabel } from "@/lib/sources";
import { AdsCell } from "@/components/AdsCell";
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
  lista_id: string | null;
  listaNome: string | null;
  anunciaGoogle: boolean | null;
  anunciaMeta: boolean | null;
  adsChecando: boolean;
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
function hrefSite(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
function dominio(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
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

  if (leads.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
        <p className="text-4xl">🗂️</p>
        <h2 className="mt-3 font-medium text-neutral-900">Nenhum lead ainda</h2>
        <p className="mt-1 text-sm text-neutral-500">
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
        <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200 text-sm">
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
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900"
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
        <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200 text-sm">
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
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-neutral-500">
          {filtered.length} de {leads.length} leads
        </span>
      </div>

      {fonte === "instagram" ? (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-sm text-neutral-500">
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
              />
            ))}
          </div>
        )
      ) : (
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
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
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((l) => (
              <tr key={l.id} className="align-top hover:bg-neutral-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{l.empresa ?? l.nome ?? "—"}</p>
                  {l.nome && l.empresa && (
                    <p className="mt-0.5 text-xs text-emerald-700">👤 {l.nome}</p>
                  )}
                  {l.endereco && <p className="mt-0.5 text-xs text-neutral-400">{l.endereco}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-700">
                  {formatarTelefone(l.telefone)}
                </td>
                <td className="px-4 py-3">
                  {temSite(l) ? (
                    <a
                      href={hrefSite(l.website!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                    >
                      {dominio(l.website!)} ↗
                    </a>
                  ) : (
                    <span className="inline-flex rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-500/20">
                      SEM SITE
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                  {l.nota != null ? (
                    <span>
                      <span className="font-medium">{l.nota.toFixed(1)}</span>
                      <span className="text-amber-500"> ★</span>
                      {l.total_avaliacoes != null && (
                        <span className="text-xs text-neutral-400"> ({l.total_avaliacoes})</span>
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
                      className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      {l.listaNome ?? "lista"}
                    </Link>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                  {sourceLabel(l.origem)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(l.id, l.lista_id)}
                    disabled={pending}
                    className="whitespace-nowrap text-xs text-neutral-500 hover:text-red-600"
                  >
                    excluir
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  Nenhum lead corresponde ao filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
