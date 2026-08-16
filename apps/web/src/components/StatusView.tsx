"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { moverLeadStatus } from "@/app/dashboard/crm/actions";
import { sourceLabel } from "@/lib/sources";

export interface StatusItem {
  id: string;
  dono: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  origem: string | null;
  website: string | null;
  instagram: string | null;
  seguidores: number | null;
  nota: number | null;
  endereco: string | null;
  campanha: string | null;
  chip: string | null;
  status: string;
}

function temSite(l: StatusItem): boolean {
  return !!(l.website && l.website.trim());
}

function hrefUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export interface CampanhaOption {
  id: string;
  nome: string;
}

type Coluna = "nao_disparado" | "pendente" | "enviado" | "entregue" | "falhou";

const COLUNAS: { key: Coluna; label: string }[] = [
  { key: "nao_disparado", label: "Não disparado" },
  { key: "pendente", label: "Pendente" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
  { key: "falhou", label: "Falhou" },
];

// 'lido' conta como Entregue. Lead sem disparo = "Não disparado".
function normalizar(status: string): Coluna {
  const s = status.toLowerCase();
  if (s === "lido" || s === "entregue") return "entregue";
  if (s === "enviado") return "enviado";
  if (s === "falhou") return "falhou";
  if (s === "pendente") return "pendente";
  return "nao_disparado";
}

const BADGE: Record<Coluna, string> = {
  nao_disparado: "bg-neutral-100 text-neutral-500 border border-neutral-200",
  pendente: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
  enviado: "bg-blue-500/10 text-blue-600 border border-blue-500/30",
  entregue: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
  falhou: "bg-red-500/10 text-red-600 border border-red-500/30",
};

// Barra colorida no topo da coluna, pra dar identidade visual.
const TOPO: Record<Coluna, string> = {
  nao_disparado: "bg-neutral-300",
  pendente: "bg-amber-400",
  enviado: "bg-blue-400",
  entregue: "bg-emerald-400",
  falhou: "bg-red-400",
};

function Badge({ coluna }: { coluna: Coluna }) {
  const label = COLUNAS.find((c) => c.key === coluna)?.label ?? coluna;
  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${BADGE[coluna]}`}>
      {label}
    </span>
  );
}

// +55 (18) 3226-5555 / +55 (18) 99999-8888
function formatarTelefone(raw: string | null): string {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  const nac = d.startsWith("55") ? d.slice(2) : d;
  if (nac.length === 11) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 7)}-${nac.slice(7)}`;
  if (nac.length === 10) return `+55 (${nac.slice(0, 2)}) ${nac.slice(2, 6)}-${nac.slice(6)}`;
  return raw;
}

function soDigitos(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

export function StatusView({
  items,
  campanhas,
}: {
  items: StatusItem[];
  campanhas: CampanhaOption[];
}) {
  const router = useRouter();
  const [visao, setVisao] = useState<"kanban" | "tabela">("kanban");
  const [campanhaId, setCampanhaId] = useState<string>("todas");

  // Cópia local pra atualização otimista ao arrastar.
  const [dados, setDados] = useState<StatusItem[]>(items);
  useEffect(() => setDados(items), [items]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Coluna | null>(null);
  const [aberto, setAberto] = useState<StatusItem | null>(null);

  const filtrados = useMemo(() => {
    if (campanhaId === "todas") return dados;
    const nome = campanhas.find((c) => c.id === campanhaId)?.nome;
    return dados.filter((i) => i.campanha === nome);
  }, [dados, campanhas, campanhaId]);

  const porColuna = useMemo(() => {
    const map: Record<Coluna, StatusItem[]> = {
      nao_disparado: [],
      pendente: [],
      enviado: [],
      entregue: [],
      falhou: [],
    };
    for (const i of filtrados) map[normalizar(i.status)].push(i);
    return map;
  }, [filtrados]);

  function mover(id: string, coluna: Coluna) {
    setDragId(null);
    setOverCol(null);
    const atual = dados.find((i) => i.id === id);
    if (!atual || normalizar(atual.status) === coluna) return;
    // Otimista: atualiza na hora.
    setDados((prev) => prev.map((i) => (i.id === id ? { ...i, status: coluna } : i)));
    moverLeadStatus(id, coluna).then((res) => {
      if (!res.ok) {
        // Reverte se falhar.
        setDados((prev) => prev.map((i) => (i.id === id ? { ...i, status: atual.status } : i)));
      }
      router.refresh();
    });
  }

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
        <>
          <p className="mb-3 text-xs text-neutral-400">
            Arraste um card entre as colunas para mudar o status · clique para ver os detalhes.
          </p>
          <div className="grid gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {COLUNAS.map((col) => (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.key);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) mover(dragId, col.key);
                }}
                className={`flex min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-neutral-50 transition ${
                  overCol === col.key
                    ? "border-emerald-400 ring-2 ring-emerald-400/30"
                    : "border-neutral-200"
                }`}
              >
                <div className={`h-1 w-full ${TOPO[col.key]}`} />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-900">{col.label}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-500 ring-1 ring-neutral-200">
                    {porColuna[col.key].length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 p-3 pt-0">
                  {porColuna[col.key].length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 px-1 py-6 text-center text-xs text-neutral-400">
                      Solte um lead aqui
                    </p>
                  ) : (
                    porColuna[col.key].map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        draggable
                        onDragStart={() => setDragId(i.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverCol(null);
                        }}
                        onClick={() => setAberto(i)}
                        className={`w-full cursor-grab rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-neutral-300 hover:shadow active:cursor-grabbing ${
                          dragId === i.id ? "opacity-40" : ""
                        }`}
                      >
                        <p className="font-semibold leading-snug text-neutral-900">
                          {i.dono ?? "—"}
                        </p>
                        {i.empresa && (
                          <p className="mt-1 text-xs leading-snug text-neutral-500">{i.empresa}</p>
                        )}
                        <p className="mt-2 text-sm tabular-nums text-neutral-700">
                          {formatarTelefone(i.telefone)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {temSite(i) ? (
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
                              Com site
                            </span>
                          ) : (
                            <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 ring-1 ring-red-500/20">
                              SEM SITE
                            </span>
                          )}
                          {i.nota != null && (
                            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                              {i.nota.toFixed(1)} ★
                            </span>
                          )}
                          {i.instagram && (
                            <span className="rounded-md bg-fuchsia-500/10 px-1.5 py-0.5 text-[11px] font-medium text-fuchsia-600">
                              Instagram
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
                          <span className="truncate">{i.campanha ?? "Sem campanha"}</span>
                          {i.chip && (
                            <>
                              <span>•</span>
                              <span className="truncate">{i.chip}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dono</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Chip</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtrados.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => setAberto(i)}
                  className="cursor-pointer align-top hover:bg-neutral-100"
                >
                  <td className="px-4 py-3 text-neutral-900">{i.dono ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.empresa ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-700">
                    {formatarTelefone(i.telefone)}
                  </td>
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

      {aberto && (
        <LeadDetail
          lead={aberto}
          onClose={() => setAberto(null)}
          onMover={(coluna) => {
            mover(aberto.id, coluna);
            setAberto((a) => (a ? { ...a, status: coluna } : a));
          }}
        />
      )}
    </div>
  );
}

function LeadDetail({
  lead,
  onClose,
  onMover,
}: {
  lead: StatusItem;
  onClose: () => void;
  onMover: (coluna: Coluna) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function copiar(valor: string, chave: string) {
    navigator.clipboard?.writeText(valor);
    setCopiado(chave);
    setTimeout(() => setCopiado((c) => (c === chave ? null : c)), 1500);
  }

  const wa = soDigitos(lead.telefone);
  const coluna = normalizar(lead.status);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/20 p-4"
      onClick={onClose}
    >
      <div
        className="anim-in w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{lead.dono ?? "Lead"}</h2>
            {lead.empresa && <p className="mt-0.5 text-sm text-neutral-500">{lead.empresa}</p>}
          </div>
          <Badge coluna={coluna} />
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <Linha
            rotulo="Telefone"
            valor={formatarTelefone(lead.telefone)}
            acao={
              lead.telefone
                ? () => copiar(formatarTelefone(lead.telefone), "tel")
                : undefined
            }
            copiado={copiado === "tel"}
          />
          <Linha
            rotulo="E-mail"
            valor={lead.email ?? "—"}
            acao={lead.email ? () => copiar(lead.email!, "email") : undefined}
            copiado={copiado === "email"}
          />
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-neutral-400">Site</dt>
            <dd className="text-right">
              {temSite(lead) ? (
                <a
                  href={hrefUrl(lead.website!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-500"
                >
                  {lead.website!.replace(/^https?:\/\//i, "").replace(/^www\./i, "")} ↗
                </a>
              ) : (
                <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-500/20">
                  SEM SITE
                </span>
              )}
            </dd>
          </div>
          {lead.nota != null && (
            <Linha rotulo="Nota (Google)" valor={`${lead.nota.toFixed(1)} ★`} />
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-neutral-400">Instagram</dt>
            <dd className="text-right">
              {lead.instagram ? (
                <a
                  href={hrefUrl(lead.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fuchsia-600 hover:text-fuchsia-500"
                >
                  ver perfil
                  {lead.seguidores != null && (
                    <span className="text-xs text-neutral-400">
                      {" "}
                      · {lead.seguidores.toLocaleString("pt-BR")}
                    </span>
                  )}{" "}
                  ↗
                </a>
              ) : (
                <span className="text-neutral-500">—</span>
              )}
            </dd>
          </div>
          {lead.endereco && <Linha rotulo="Endereço" valor={lead.endereco} />}
          <Linha rotulo="Origem" valor={lead.origem ? sourceLabel(lead.origem) : "—"} />
          <Linha rotulo="Campanha" valor={lead.campanha ?? "Sem campanha"} />
          <Linha rotulo="Chip" valor={lead.chip ?? "—"} />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
            >
              Abrir no WhatsApp
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Enviar e-mail
            </a>
          )}
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Mover para
          </p>
          <div className="flex flex-wrap gap-2">
            {COLUNAS.map((c) => (
              <button
                key={c.key}
                onClick={() => onMover(c.key)}
                disabled={c.key === coluna}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  c.key === coluna
                    ? "cursor-default bg-neutral-100 text-neutral-400"
                    : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Linha({
  rotulo,
  valor,
  acao,
  copiado,
}: {
  rotulo: string;
  valor: string;
  acao?: () => void;
  copiado?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-neutral-400">{rotulo}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-right">
        <span className="truncate text-neutral-800">{valor}</span>
        {acao && (
          <button
            onClick={acao}
            className="shrink-0 text-xs text-emerald-600 hover:text-emerald-500"
          >
            {copiado ? "copiado!" : "copiar"}
          </button>
        )}
      </dd>
    </div>
  );
}
