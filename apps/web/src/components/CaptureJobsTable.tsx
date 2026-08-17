"use client";

import { sourceLabel } from "@/lib/sources";

export type CaptureJob = {
  id: string;
  origem: string | null;
  termo_busca: string | null;
  localizacao: string | null;
  quantidade: number | null;
  status: string;
  criado_em: string;
  buscandoDonos?: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-neutral-100 text-neutral-700 border-neutral-300",
  rodando: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  concluido: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  erro: "bg-red-500/10 text-red-600 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  rodando: "Rodando",
  concluido: "Concluído",
  erro: "Erro",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pendente;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CaptureJobsTable({ jobs }: { jobs: CaptureJob[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Termo</th>
            <th className="px-4 py-3 font-medium">Localização</th>
            <th className="px-4 py-3 font-medium">Qtd</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {jobs.map((job) => (
            <tr key={job.id} className="text-neutral-800 transition hover:bg-neutral-100">
              <td className="px-4 py-3">{sourceLabel(job.origem)}</td>
              <td className="px-4 py-3">{job.termo_busca ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-500">{job.localizacao ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-500">{job.quantidade ?? "—"}</td>
              <td className="px-4 py-3">
                {job.status === "concluido" && job.buscandoDonos ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    Buscando donos…
                  </span>
                ) : (
                  <StatusBadge status={job.status} />
                )}
              </td>
              <td className="px-4 py-3 text-neutral-500">{formatDate(job.criado_em)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
