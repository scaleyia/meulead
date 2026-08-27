"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { dispararCampanha, excluirCampanha, enviarFollowup } from "@/app/dashboard/campaigns/actions";

type Status = "rascunho" | "agendada" | "enviando" | "concluida" | "pausada";

type Metricas = { total: number; enviados: number; entregues: number; falhou: number };

type Campanha = {
  id: string;
  nome: string;
  status: string;
  modo_envio: string | null;
  criado_em: string;
  followup_mensagem: string | null;
  followup_enviado: boolean;
  metricas: Metricas;
};

const STATUS_LABEL: Record<Status, string> = {
  rascunho: "Rascunho",
  agendada: "Agendada",
  enviando: "Enviando",
  concluida: "Concluída",
  pausada: "Pausada",
};

const STATUS_BADGE: Record<Status, string> = {
  rascunho: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
  agendada: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  enviando: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  concluida: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  pausada: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
};

const FALLBACK_BADGE = "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700";

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

  const followup = (c: Campanha) => {
    setError(null);
    setPendingId(c.id);
    start(async () => {
      const res = await enviarFollowup(c.id);
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

      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Campanha</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Resultados</th>
              <th className="px-4 py-3 font-medium">Modo</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {campanhas.map((c) => {
              const podeDisparar = c.status === "rascunho" || c.status === "pausada";
              const busy = pendingId === c.id;
              const modo = c.modo_envio === "manual" ? "Manual" : "Auto";
              return (
                <tr key={c.id} className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{c.nome}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status as Status] ?? FALLBACK_BADGE}`}
                    >
                      {STATUS_LABEL[c.status as Status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.metricas.total === 0 ? (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-neutral-600 dark:text-neutral-300">
                          {c.metricas.total} alvos
                        </span>
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600">
                          {c.metricas.enviados} enviados
                        </span>
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600 dark:text-blue-400">
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
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{modo}</td>
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
                      {c.followup_mensagem &&
                        !c.followup_enviado &&
                        (c.status === "enviando" || c.status === "concluida") && (
                          <Button
                            variant="ghost"
                            className="px-3 py-1 text-xs"
                            disabled={busy}
                            onClick={() => followup(c)}
                          >
                            {busy ? "Enviando…" : "Enviar follow-up"}
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
