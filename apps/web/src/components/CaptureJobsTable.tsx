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
};

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-neutral-500/10 text-neutral-300 border-neutral-700",
  rodando: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  concluido: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  erro: "bg-red-500/10 text-red-400 border-red-500/30",
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
    <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900/60 text-neutral-400">
          <tr>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Termo</th>
            <th className="px-4 py-3 font-medium">Localização</th>
            <th className="px-4 py-3 font-medium">Qtd</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {jobs.map((job) => (
            <tr key={job.id} className="text-neutral-200 transition hover:bg-neutral-900/40">
              <td className="px-4 py-3">{sourceLabel(job.origem)}</td>
              <td className="px-4 py-3">{job.termo_busca ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-400">{job.localizacao ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-400">{job.quantidade ?? "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 text-neutral-500">{formatDate(job.criado_em)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
