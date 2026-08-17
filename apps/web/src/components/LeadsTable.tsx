"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/dashboard/lists/[id]/actions";
import { sourceLabel } from "@/lib/sources";

interface LeadRow {
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
}

// Deixa o telefone legível: +55 (18) 3226-5555 / +55 (11) 99999-8888
function formatarTelefone(raw: string | null): string {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  const nac = d.startsWith("55") ? d.slice(2) : d;
  if (nac.length === 11) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 7)}-${nac.slice(7)}`;
  if (nac.length === 10) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 6)}-${nac.slice(6)}`;
  return raw;
}

function temSite(l: LeadRow): boolean {
  return !!(l.website && l.website.trim());
}

function hrefSite(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function dominio(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
}

type Filtro = "todos" | "sem_site" | "com_site";

export function LeadsTable({ listId, leads }: { listId: string; leads: LeadRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pending, start] = useTransition();

  const semSiteCount = useMemo(() => leads.filter((l) => !temSite(l)).length, [leads]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtro === "sem_site" && temSite(l)) return false;
      if (filtro === "com_site" && !temSite(l)) return false;
      if (!term) return true;
      return [l.nome, l.empresa, l.telefone, l.email, l.website].some((v) =>
        v?.toLowerCase().includes(term),
      );
    });
  }, [q, filtro, leads]);

  function remove(id: string) {
    if (!confirm("Excluir este lead?")) return;
    start(async () => {
      await deleteLead(id, listId);
      router.refresh();
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
        <p className="text-4xl">🗂️</p>
        <h2 className="mt-3 font-medium text-neutral-900">Lista vazia</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Os leads aparecem aqui assim que a captação terminar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, empresa, telefone, e-mail ou site…"
          className="input max-w-md"
        />
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
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa / Dono</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Nota</th>
              <th className="px-4 py-3 font-medium">Contato</th>
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
                    <p className="mt-0.5 text-xs font-medium text-emerald-700">👤 {l.nome}</p>
                  )}
                  {l.endereco && (
                    <p className="mt-0.5 text-xs text-neutral-400">{l.endereco}</p>
                  )}
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
                <td className="px-4 py-3 text-neutral-700">
                  {l.instagram ? (
                    <a
                      href={hrefSite(l.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fuchsia-600 hover:text-fuchsia-500"
                    >
                      Instagram
                      {l.seguidores != null && (
                        <span className="text-xs text-neutral-400">
                          {" "}
                          · {l.seguidores.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </a>
                  ) : l.email ? (
                    <span className="break-all text-xs">{l.email}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                  {sourceLabel(l.origem)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(l.id)}
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
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Nenhum lead corresponde ao filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        {filtered.length} de {leads.length} leads
      </p>
    </div>
  );
}
