"use client";

import type { AllLeadRow } from "@/components/AllLeadsTable";

function hrefUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
function dominio(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
}
function handle(url: string | null): string {
  if (!url) return "";
  const m = url.replace(/\/+$/, "").match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : "";
}
function compacto(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// Card de lead vindo do Instagram — mostra tudo que a API traz.
export function InstagramLeadCard({
  lead,
  onExcluir,
  excluindo,
  onEnviarCrm,
  noCrm,
  enviandoCrm,
}: {
  lead: AllLeadRow;
  onExcluir: () => void;
  excluindo: boolean;
  onEnviarCrm: () => void;
  noCrm: boolean;
  enviandoCrm: boolean;
}) {
  const user = handle(lead.instagram);

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm transition hover:shadow">
      <div className="flex items-start gap-3">
        {lead.fotoPerfil ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.fotoPerfil}
            alt={lead.empresa ?? "perfil"}
            referrerPolicy="no-referrer"
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-neutral-100"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-lg text-neutral-400 dark:text-neutral-500">
            📸
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100">{lead.empresa ?? user}</p>
            {lead.verificado && <span title="Verificado">☑️</span>}
          </div>
          {user && (
            <a
              href={lead.instagram ? hrefUrl(lead.instagram) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fuchsia-600 hover:text-fuchsia-500"
            >
              {user}
            </a>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {lead.seguidores != null && (
              <span>
                <strong className="text-neutral-800 dark:text-neutral-100">{compacto(lead.seguidores)}</strong> seguidores
              </span>
            )}
            {lead.posts != null && (
              <span>
                <strong className="text-neutral-800 dark:text-neutral-100">{compacto(lead.posts)}</strong> posts
              </span>
            )}
          </div>
        </div>
      </div>

      {lead.bio && (
        <p className="mt-3 whitespace-pre-line text-sm leading-snug text-neutral-600 dark:text-neutral-300 line-clamp-4">
          {lead.bio}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.categoria && (
          <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-600 dark:text-neutral-300">
            {lead.categoria}
          </span>
        )}
        {lead.telefone && (
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            📞 {lead.telefone}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {lead.instagram && (
            <a
              href={hrefUrl(lead.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fuchsia-600 hover:text-fuchsia-500"
            >
              Ver perfil ↗
            </a>
          )}
          {lead.website ? (
            <a
              href={hrefUrl(lead.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              🔗 {dominio(lead.website)}
            </a>
          ) : (
            <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 ring-1 ring-red-500/20">
              SEM SITE
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {noCrm ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">✓ no CRM</span>
          ) : (
            <button
              onClick={onEnviarCrm}
              disabled={enviandoCrm}
              title="Enviar este lead para o CRM"
              className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-500/20 disabled:opacity-60 dark:text-blue-300"
            >
              {enviandoCrm ? "enviando…" : "→ CRM"}
            </button>
          )}
          <button
            onClick={onExcluir}
            disabled={excluindo}
            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-600"
          >
            excluir
          </button>
        </div>
      </div>
    </div>
  );
}
