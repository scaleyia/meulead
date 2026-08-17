"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";
import { criarCampanha } from "@/app/dashboard/campaigns/actions";

type Lista = { id: string; nome: string };
type Sessao = { id: string; nome: string; status: string | null };
type ModoEnvio = "auto" | "manual";

// Modelos prontos de mensagem. {{nome}} é trocado pelo nome do dono no disparo.
const TEMPLATES: { rotulo: string; texto: string }[] = [
  {
    rotulo: "Apresentação",
    texto:
      "Olá {{nome}}, tudo bem? Aqui é da [Sua Agência]. Ajudamos negócios como o seu a atrair mais clientes pela internet. Posso te mandar rapidinho como funciona?",
  },
  {
    rotulo: "Sem site",
    texto:
      "Oi {{nome}}! Vi que o seu negócio ainda não tem um site — hoje isso faz muita diferença pra quem pesquisa no Google antes de comprar. Criamos um site profissional pra você. Quer ver alguns exemplos?",
  },
  {
    rotulo: "Anúncios / tráfego",
    texto:
      "Olá {{nome}}! Notei que você já investe em anúncios. Consigo te mostrar como melhorar o retorno e pagar menos por cliente. Faz sentido a gente conversar 5 minutinhos?",
  },
  {
    rotulo: "Google Meu Negócio",
    texto:
      "Oi {{nome}}, tudo bem? Ajudo empresas a aparecerem no topo do Google Maps da sua região e a receberem mais ligações. Posso te explicar como?",
  },
  {
    rotulo: "Promoção",
    texto:
      "Olá {{nome}}! Estamos com uma condição especial neste mês para novos clientes. Quer que eu te envie os detalhes sem compromisso?",
  },
];

export function CampaignForm({
  listas,
  sessoes,
}: {
  listas: Lista[];
  sessoes: Sessao[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      title="Nova campanha"
      description="Prepare um disparo em massa com revezamento entre os chips."
      trigger={(open) => <Button onClick={open}>+ Nova campanha</Button>}
    >
      {(close) => (
        <CampaignFields
          listas={listas}
          sessoes={sessoes}
          pending={pending}
          error={error}
          onCancel={close}
          onSubmit={(input) => {
            setError(null);
            start(async () => {
              const res = await criarCampanha(input);
              if (!res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        />
      )}
    </Modal>
  );
}

function CampaignFields({
  listas,
  sessoes,
  pending,
  error,
  onCancel,
  onSubmit,
}: {
  listas: Lista[];
  sessoes: Sessao[];
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (input: {
    nome: string;
    listaId: string | null;
    mensagem: string;
    sessaoIds: string[];
    modoEnvio: ModoEnvio;
    intervaloMin: number;
    intervaloMax: number;
    limiteDiario: number;
    agendadaPara: string | null;
  }) => void;
}) {
  const [nome, setNome] = useState("");
  const [listaId, setListaId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sessaoIds, setSessaoIds] = useState<string[]>([]);
  const [modoEnvio, setModoEnvio] = useState<ModoEnvio>("auto");
  const [intervaloMin, setIntervaloMin] = useState(30);
  const [intervaloMax, setIntervaloMax] = useState(90);
  const [limiteDiario, setLimiteDiario] = useState(200);
  const [agendarPara, setAgendarPara] = useState("");

  const toggleSessao = (id: string) =>
    setSessaoIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  return (
    <form
      className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          nome,
          listaId: listaId || null,
          mensagem,
          sessaoIds,
          modoEnvio,
          intervaloMin,
          intervaloMax,
          limiteDiario,
          agendadaPara: agendarPara ? new Date(agendarPara).toISOString() : null,
        });
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Nome da campanha</span>
        <input
          name="nome"
          required
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Promoção de Julho"
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Lista de contatos</span>
        <select
          value={listaId}
          onChange={(e) => setListaId(e.target.value)}
          className="input"
        >
          <option value="">— Selecione depois</option>
          {listas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Mensagem</span>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-neutral-400">Modelos:</span>
          {TEMPLATES.map((t) => (
            <button
              key={t.rotulo}
              type="button"
              onClick={() => setMensagem(t.texto)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t.rotulo}
            </button>
          ))}
        </div>
        <textarea
          required
          rows={5}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Olá {{nome}}, tudo bem?"
          className="input resize-y"
        />
        <span className="text-xs text-neutral-500">
          Clique num modelo pra preencher. Use {"{{nome}}"} para personalizar com o nome do dono. E
          troque [Sua Agência] pelo seu nome.
        </span>
      </label>

      {/* Chips (contingência) — pool que será revezado no disparo. */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Chips (contingência)</span>
        {sessoes.length === 0 ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
            Conecte um número em Conectar WhatsApp.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 p-3">
              {sessoes.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-800"
                >
                  <input
                    type="checkbox"
                    checked={sessaoIds.includes(s.id)}
                    onChange={() => toggleSessao(s.id)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  <span>{s.nome}</span>
                </label>
              ))}
            </div>
            <span className="text-xs text-neutral-500">
              O sistema reveza os disparos entre os números marcados.
            </span>
          </>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Agendar disparo (opcional)</span>
        <input
          type="datetime-local"
          value={agendarPara}
          onChange={(e) => setAgendarPara(e.target.value)}
          className="input"
        />
        <span className="text-xs text-neutral-500">
          Deixe vazio para disparar manualmente. Se agendar, o sistema dispara sozinho no horário.
        </span>
      </label>

      {/* Modo de envio */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Modo de envio</span>
        <div className="grid grid-cols-2 gap-2">
          <ModeCard
            active={modoEnvio === "auto"}
            onClick={() => setModoEnvio("auto")}
            title="⚙️ Automático"
            hint="O sistema escolhe intervalos seguros"
          />
          <ModeCard
            active={modoEnvio === "manual"}
            onClick={() => setModoEnvio("manual")}
            title="✋ Manual"
            hint="Você define os intervalos e o limite"
          />
        </div>

        {modoEnvio === "manual" && (
          <div className="mt-1 grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Intervalo mín. (s)</span>
              <input
                type="number"
                min={1}
                value={intervaloMin}
                onChange={(e) => setIntervaloMin(Number(e.target.value))}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Intervalo máx. (s)</span>
              <input
                type="number"
                min={1}
                value={intervaloMax}
                onChange={(e) => setIntervaloMax(Number(e.target.value))}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Limite por dia</span>
              <input
                type="number"
                min={1}
                value={limiteDiario}
                onChange={(e) => setLimiteDiario(Number(e.target.value))}
                className="input"
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Criando…" : "Criar campanha"}
        </Button>
      </div>
    </form>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-1 rounded-lg border p-3 text-left transition",
        active
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-neutral-200 bg-neutral-100 hover:border-neutral-300",
      )}
    >
      <span className="text-sm font-medium text-neutral-900">{title}</span>
      <span className="text-xs text-neutral-500">{hint}</span>
    </button>
  );
}
