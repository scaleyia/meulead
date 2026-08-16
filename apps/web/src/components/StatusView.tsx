"use client";

import { useMemo, useState } from "react";

export interface StatusItem {
  id: string;
  dono: string | null;
  empresa: string | null;
  telefone: string | null;
  campanha: string | null;
  chip: string | null;
  status: string;
}

export interface CampanhaOption {
  id: string;
  nome: string;
}

type Coluna = "pendente" | "enviado" | "entregue" | "falhou";

const COLUNAS: { key: Coluna; label: string }[] = [
  { key: "pendente", label: "Pendente" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
  { key: "falhou", label: "Falhou" },
];

// 'lido' conta como Entregue.
function normalizar(status: string): Coluna {
  const s = status.toLowerCase();
  if (s === "lido" || s === "entregue") return "entregue";
  if (s === "enviado") return "enviado";
  if (s === "falhou") return "falhou";
  return "pendente";
}

const BADGE: Record<Coluna, string> = {
  pendente: "bg-neutral-100 text-neutral-700 border border-neutral-300",
  enviado: "bg-blue-500/10 text-blue-600 border border-blue-500/30",
  entregue: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
  falhou: "bg-red-500/10 text-red-600 border border-red-500/30",
};

function Badge({ coluna }: { coluna: Coluna }) {
  const label = COLUNAS.find((c) => c.key === coluna)?.label ?? coluna;
  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${BADGE[coluna]}`}>
      {label}
    </span>
  );
}

export function StatusView({
  items,
  campanhas,
}: {
  items: StatusItem[];
  campanhas: CampanhaOption[];
}) {
  const [visao, setVisao] = useState<"kanban" | "tabela">("kanban");
  const [campanhaId, setCampanhaId] = useState<string>("todas");

  const filtrados = useMemo(() => {
    if (campanhaId === "todas") return items;
    const nome = campanhas.find((c) => c.id === campanhaId)?.nome;
    return items.filter((i) => i.campanha === nome);
  }, [items, campanhas, campanhaId]);

  const porColuna = useMemo(() => {
    const map: Record<Coluna, StatusItem[]> = {
      pendente: [],
      enviado: [],
      entregue: [],
      falhou: [],
    };
    for (const i of filtrados) map[normalizar(i.status)].push(i);
    return map;
  }, [filtrados]);

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200">
          <button
            onClick={() => setVisao("kanban")}
            className={`px-4 py-2 text-sm font-medium transition ${
              visao === "kanban"
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setVisao("tabela")}
            className={`px-4 py-2 text-sm font-medium transition ${
              visao === "tabela"
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Tabela
          </button>
        </div>

        <select
          value={campanhaId}
          onChange={(e) => setCampanhaId(e.target.value)}
          className="input max-w-xs"
        >
          <option value="todas">Todas as campanhas</option>
          {campanhas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-neutral-500">{filtrados.length} leads</span>
      </div>

      {visao === "kanban" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUNAS.map((col) => (
            <div
              key={col.key}
              className="rounded-xl border border-neutral-200 bg-neutral-50"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <span className="text-sm font-medium text-neutral-900">{col.label}</span>
                <span className="text-xs text-neutral-500">{porColuna[col.key].length}</span>
              </div>
              <div className="space-y-3 p-3">
                {porColuna[col.key].length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-neutral-400">
                    Nenhum lead aqui.
                  </p>
                ) : (
                  porColuna[col.key].map((i) => (
                    <div
                      key={i.id}
                      className="rounded-xl border border-neutral-200 bg-white p-3"
                    >
                      <p className="font-medium text-neutral-900">{i.dono ?? "—"}</p>
                      {i.empresa && (
                        <p className="mt-0.5 text-xs text-neutral-500">{i.empresa}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">{i.telefone ?? "—"}</p>
                      <div className="mt-3 flex flex-wrap gap-1 border-t border-neutral-200 pt-2 text-[11px] text-neutral-500">
                        <span>{i.campanha ?? "—"}</span>
                        <span className="text-neutral-400">•</span>
                        <span>{i.chip ?? "—"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dono</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Chip</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtrados.map((i) => (
                <tr key={i.id} className="hover:bg-neutral-100">
                  <td className="px-4 py-3 text-neutral-900">{i.dono ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{i.campanha ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{i.chip ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge coluna={normalizar(i.status)} />
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum lead nesta campanha.
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
