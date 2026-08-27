"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  criarSessao,
  conectarSessao,
  checarConexao,
  desconectarSessao,
  excluirSessao,
  salvarAquecimento,
} from "@/app/dashboard/whatsapp/actions";

type Status = "desconectado" | "conectando" | "conectado";

// O jsonb vem tipado de forma tolerante (pode ser null ou objeto parcial).
export type AquecimentoConfig = {
  tecnicas?: string[];
  meta_diaria?: number;
} | null;

export interface Sessao {
  id: string;
  nome: string;
  instancia: string;
  numero: string | null;
  status: string;
  aquecimento_ativo: boolean;
  aquecimento_config: AquecimentoConfig;
  criado_em: string;
}

// Técnicas de aquecimento (chave → rótulo). Executadas pelo n8n.
const TECNICAS: { key: string; label: string }[] = [
  { key: "rampa", label: "Rampa de volume (aumenta os envios por dia gradualmente)" },
  { key: "conversa_chips", label: "Conversa entre seus chips (seus números trocam mensagens)" },
  { key: "intervalos_aleatorios", label: "Intervalos aleatórios entre envios" },
  { key: "horario_comercial", label: "Enviar só em horário comercial (9h–18h)" },
  { key: "variar_mensagem", label: "Variar a mensagem (evita texto idêntico)" },
  { key: "pausas_lote", label: "Pausas entre lotes (descanso a cada N envios)" },
];

const STATUS_META: Record<Status, { label: string; badge: string; dot: string }> = {
  desconectado: {
    label: "Desconectado",
    badge: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
    dot: "bg-neutral-400",
  },
  conectando: {
    label: "Conectando…",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    dot: "bg-amber-400",
  },
  conectado: {
    label: "Conectado",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
};

export function WhatsappPanel({ sessoes }: { sessoes: Sessao[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  function act(id: string, fn: (id: string) => Promise<unknown>) {
    setPendingId(id);
    start(async () => {
      await fn(id);
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-neutral-900 dark:text-neutral-100">Números</h2>
        <NovaSessao />
      </div>

      {sessoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
          <p className="text-4xl">📱</p>
          <h3 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhum número conectado</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Adicione um número para começar a disparar suas campanhas.
          </p>
          <div className="mt-5 flex justify-center">
            <NovaSessao />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessoes.map((s) => {
            const meta = STATUS_META[s.status as Status] ?? STATUS_META.desconectado;
            const busy = pendingId === s.id;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{s.nome}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {s.numero || "Ainda não conectado"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    {s.aquecimento_ativo && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                        🔥 Aquecendo
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {s.status === "conectado" ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => act(s.id, desconectarSessao)}
                    >
                      Desconectar
                    </Button>
                  ) : (
                    <QrConnect sessao={s} />
                  )}
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(`Remover o número "${s.nome}"?`)) act(s.id, excluirSessao);
                    }}
                  >
                    ✕
                  </Button>
                </div>

                <div className="mt-2">
                  <AquecimentoModal sessao={s} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NovaSessao() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      title="Novo número"
      description="Dê um nome para identificar este número (ex: Comercial)."
      trigger={(open) => <Button onClick={open}>+ Número</Button>}
    >
      {(close) => (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const nome = String(fd.get("nome") ?? "");
            if (!nome.trim()) return setError("Dê um nome ao número.");
            start(async () => {
              const res = await criarSessao(nome);
              if (res && !res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          <input name="nome" autoFocus placeholder="Ex: Comercial" className="input" />
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function AquecimentoModal({ sessao }: { sessao: Sessao }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Narrowing tolerante do jsonb.
  const config = sessao.aquecimento_config ?? {};
  const tecnicasIniciais = Array.isArray(config.tecnicas) ? config.tecnicas : [];
  const metaInicial =
    typeof config.meta_diaria === "number" && config.meta_diaria > 0 ? config.meta_diaria : 100;

  const [ativo, setAtivo] = useState(sessao.aquecimento_ativo);
  const [marcadas, setMarcadas] = useState<string[]>(tecnicasIniciais);
  const [meta, setMeta] = useState<number>(metaInicial);

  function toggleTecnica(key: string) {
    setMarcadas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <Modal
      title={`Aquecimento — ${sessao.nome}`}
      description="Ative o aquecimento anti-bloqueio e escolha as técnicas."
      trigger={(open) => (
        <Button variant="outline" className="w-full" onClick={open}>
          🔥 Aquecimento
        </Button>
      )}
    >
      {(close) => (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            start(async () => {
              const res = await salvarAquecimento(sessao.id, ativo, marcadas, meta);
              if (res && !res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          <label className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-3 py-2.5">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Ativar aquecimento</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-400"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
          </label>

          <div className={ativo ? "" : "pointer-events-none opacity-40"}>
            <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Técnicas</p>
            <div className="flex flex-col gap-2">
              {TECNICAS.map((t) => (
                <label
                  key={t.key}
                  className="flex items-start gap-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-blue-400"
                    checked={marcadas.includes(t.key)}
                    onChange={() => toggleTecnica(t.key)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Meta de envios por dia
              </label>
              <input
                type="number"
                min={1}
                className="input"
                value={meta}
                onChange={(e) => setMeta(Number(e.target.value))}
              />
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            As técnicas são executadas automaticamente pelo n8n.
          </p>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function QrConnect({ sessao }: { sessao: Sessao }) {
  return (
    <Modal
      title={`Conectar — ${sessao.nome}`}
      description="Escaneie o QR code com o WhatsApp do celular."
      trigger={(open) => (
        <Button className="flex-1" onClick={open}>
          {sessao.status === "conectando" ? "Ver QR" : "Conectar"}
        </Button>
      )}
    >
      {(close) => <QrContent sessaoId={sessao.id} close={close} />}
    </Modal>
  );
}

function QrContent({ sessaoId, close }: { sessaoId: string; close: () => void }) {
  const router = useRouter();
  const [qr, setQr] = useState<string | null>(null);
  const [pairing, setPairing] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      const r = await conectarSessao(sessaoId);
      if (!ativo) return;
      if (!r.ok) {
        setErro(r.error);
        setCarregando(false);
        return;
      }
      setQr(r.qr);
      setPairing(r.pairingCode);
      setCarregando(false);

      timer = setInterval(async () => {
        const c = await checarConexao(sessaoId);
        if (!ativo) return;
        if (c.estado === "conectado") {
          if (timer) clearInterval(timer);
          setConectado(true);
          router.refresh();
          setTimeout(() => ativo && close(), 1400);
        }
      }, 3000);
    })();

    return () => {
      ativo = false;
      if (timer) clearInterval(timer);
    };
  }, [sessaoId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (conectado) {
    return (
      <div className="py-10 text-center">
        <p className="text-5xl">✅</p>
        <p className="mt-3 font-medium text-blue-600 dark:text-blue-400">Número conectado!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {carregando && <p className="py-10 text-sm text-neutral-500 dark:text-neutral-400">Gerando QR code…</p>}
      {erro && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{erro}</p>
      )}
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt="QR code do WhatsApp" className="h-56 w-56 rounded-lg bg-white dark:bg-neutral-900 p-2" />
      )}
      {qr && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          Abra o WhatsApp → <strong>Aparelhos conectados</strong> → Conectar um aparelho → escaneie.
        </p>
      )}
      {pairing && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          ou use o código: <span className="font-mono text-neutral-700 dark:text-neutral-200">{pairing}</span>
        </p>
      )}
      {qr && <p className="text-xs text-neutral-400 dark:text-neutral-500">Aguardando leitura…</p>}
    </div>
  );
}
