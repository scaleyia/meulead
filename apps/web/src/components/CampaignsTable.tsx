"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { dispararCampanha, excluirCampanha } from "@/app/dashboard/campaigns/actions";

type Status = "rascunho" | "agendada" | "enviando" | "concluida" | "pausada";

type Metricas = { total: number; enviados: number; entregues: number; falhou: number };

type Campanha = {
  id: string;
  nome: string;
  status: string;
  modo_envio: string | null;
  criado_em: string;
  agendada_para: string | null;
  metricas: Metricas;
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<Status, string> = {
  rascunho: "Rascunho",
  agendada: "Agendada",
  enviando: "Enviando",
  concluida: "Concluída",
  pausada: "Pausada",
};

const STATUS_BADGE: Record<Status, string> = {
  rascunho: "bg-neutral-100 text-neutral-700 border-neutral-300",
  agendada: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  enviando: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  concluida: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  pausada: "bg-neutral-100 text-neutral-700 border-neutral-300",
};

const FALLBACK_BADGE = "bg-neutral-100 text-neutral-700 border-neutral-300";

export function CampaignsTable({ campanhas }: { campanhas: Campanha[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const disparar = (c: Campanha) => {
    setError(null);
    setPendingId(c.id);
    start(async () => {
      const res = await dispararCampanha(c.id);
      setPendingId(null);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  };

  const excluir = (c: Campanha) => {
    if (!confirm(`Excluir a campanha "${c.nome}"?`)) return;
    setError(null);
    setPendingId(c.id);
    start(async () => {
      const res = await excluirCampanha(c.id);
      setPendingId(null);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Campanha</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Resultados</th>
              <th className="px-4 py-3 font-medium">Modo</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {campanhas.map((c) => {
              const podeDisparar = c.status === "rascunho" || c.status === "pausada";
              const busy = pendingId === c.id;
              const modo = c.modo_envio === "manual" ? "Manual" : "Auto";
              return (
                <tr key={c.id} className="bg-neutral-100 hover:bg-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.nome}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status as Status] ?? FALLBACK_BADGE}`}
                    >
                      {STATUS_LABEL[c.status as Status] ?? c.status}
                    </span>
                    {c.agendada_para && (
                      <span className="mt-1 block text-[11px] text-blue-600">
                        📅 {formatarDataHora(c.agendada_para)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.metricas.total === 0 ? (
                      <span className="text-xs text-neutral-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600">
                          {c.metricas.total} alvos
                        </span>
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600">
                          {c.metricas.enviados} enviados
                        </span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600">
                          {c.metricas.entregues} entregues
                        </span>
                        {c.metricas.falhou > 0 && (
                          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-600">
                            {c.metricas.falhou} falhas
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{modo}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {podeDisparar && (
                        <Button
                          variant="primary"
                          className="px-3 py-1 text-xs"
                          disabled={busy}
                          onClick={() => disparar(c)}
                        >
                          {busy ? "Disparando…" : "Disparar"}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        className="px-3 py-1 text-xs"
                        disabled={busy}
                        onClick={() => excluir(c)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
