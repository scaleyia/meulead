"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/dashboard/lists/[id]/actions";
import { sourceLabel } from "@/lib/sources";

// Deixa o telefone legível: +55 (18) 3226-5555 / +55 (11) 99999-8888
function formatarTelefone(raw: string | null): string {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  const nac = d.startsWith("55") ? d.slice(2) : d;
  if (nac.length === 11) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 7)}-${nac.slice(7)}`;
  if (nac.length === 10) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 6)}-${nac.slice(6)}`;
  return raw; // formato inesperado: mostra como veio
}

interface LeadRow {
  id: string;
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  origem: string;
}

export function LeadsTable({ listId, leads }: { listId: string; leads: LeadRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((l) =>
      [l.nome, l.empresa, l.telefone, l.email].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [q, leads]);

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
          Adicione um lead manualmente ou importe um arquivo CSV.
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome, empresa, telefone ou e-mail…"
        className="input mb-3 max-w-md"
      />

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((l) => (
              <tr key={l.id} className="align-top hover:bg-neutral-100">
                <td className="px-4 py-3 text-neutral-900">{l.nome ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{l.empresa ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-700">
                  {formatarTelefone(l.telefone)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <span className="break-all">{l.email ?? "—"}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{sourceLabel(l.origem)}</td>
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
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Nenhum lead corresponde a “{q}”.
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
