"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { analisarSiteLead } from "@/app/dashboard/leads/actions";

function hrefSite(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
function dominio(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
}

// Mostra o site (ou SEM SITE) + análise de qualidade/SEO sob demanda.
export function SiteCell({
  leadId,
  website,
  siteScore,
  siteAnalisado,
}: {
  leadId: string;
  website: string | null;
  siteScore: number | null;
  siteAnalisado: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (!website || !website.trim()) {
    return (
      <span className="inline-flex rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-500/20">
        SEM SITE
      </span>
    );
  }

  const analisar = () =>
    start(async () => {
      await analisarSiteLead(leadId);
      router.refresh();
    });

  return (
    <div className="flex flex-col items-start gap-1">
      <a
        href={hrefSite(website)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200"
      >
        {dominio(website)} ↗
      </a>
      {pending ? (
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">analisando…</span>
      ) : siteAnalisado && siteScore !== null ? (
        <button onClick={analisar} title="Analisar de novo" className="inline-flex items-center gap-1">
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
              siteScore < 60
                ? "bg-red-500/10 text-red-600"
                : siteScore < 80
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {siteScore < 60 ? "Site fraco" : siteScore < 80 ? "Site médio" : "Site bom"} · {siteScore}
          </span>
        </button>
      ) : (
        <button
          onClick={analisar}
          className="text-[11px] text-neutral-500 dark:text-neutral-400 underline-offset-2 hover:text-neutral-800 hover:underline"
        >
          🔎 analisar site
        </button>
      )}
    </div>
  );
}
