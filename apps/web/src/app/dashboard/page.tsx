import Link from "next/link";
import {
  Users,
  Globe,
  Target,
  Send,
  Radar,
  MessageCircle,
  KanbanSquare,
  Coins,
  ArrowRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { calcularScore } from "@/lib/score";
import { clsx } from "@/lib/clsx";

export default async function DashboardPage() {
  const supabase = await createClient();
  const org = await getActiveOrg();

  const [leadsRes, listas, campanhas, alvosRes, sessoes] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "website, tem_whatsapp, anuncia_google, anuncia_meta, nota, total_avaliacoes, telefone, seguidores, origem, site_score, nome",
      ),
    supabase.from("listas").select("*", { count: "exact", head: true }),
    supabase.from("campanhas").select("*", { count: "exact", head: true }),
    supabase.from("campanha_alvos").select("status"),
    supabase.from("sessoes_whatsapp").select("status"),
  ]);

  const leadsRows = leadsRes.data ?? [];
  const nLeads = leadsRows.length;
  const gmaps = leadsRows.filter((l) => l.origem === "google_maps");
  const semSite = gmaps.filter((l) => !(l.website && String(l.website).trim())).length;
  const quentes = gmaps.filter(
    (l) =>
      calcularScore({
        website: l.website,
        siteScore: l.site_score,
        anunciaGoogle: l.anuncia_google,
        anunciaMeta: l.anuncia_meta,
        nota: l.nota,
        totalAvaliacoes: l.total_avaliacoes,
        telefone: l.telefone,
        temWhatsapp: l.tem_whatsapp,
        temDono: !!l.nome,
        seguidores: l.seguidores,
      }).nivel === "quente",
  ).length;
  const comWhats = leadsRows.filter((l) => l.tem_whatsapp === true).length;

  const alvos = alvosRes.data ?? [];
  const enviados = alvos.filter((a) => {
    const s = (a.status ?? "").toLowerCase();
    return s === "enviado" || s === "entregue" || s === "lido";
  }).length;

  const nCampanhas = campanhas.count ?? 0;
  const conectados = (sessoes.data ?? []).filter((s) => s.status === "conectado").length;
  const creditos = org ? org.creditosPlano + org.creditosExtra : 0;
  const pctSemSite = gmaps.length ? Math.round((semSite / gmaps.length) * 100) : 0;

  const stats: {
    label: string;
    value: string;
    sub?: string;
    href: string;
    icon: LucideIcon;
    cor: string;
  }[] = [
    { label: "Leads captados", value: nLeads.toLocaleString("pt-BR"), href: "/dashboard/leads", icon: Users, cor: "blue" },
    { label: "Sem site (oportunidade)", value: semSite.toLocaleString("pt-BR"), sub: `${pctSemSite}% dos do Maps`, href: "/dashboard/leads", icon: Globe, cor: "red" },
    { label: "Leads quentes", value: quentes.toLocaleString("pt-BR"), sub: "prontos p/ vender", href: "/dashboard/oportunidades", icon: Target, cor: "amber" },
    { label: "Com WhatsApp", value: comWhats.toLocaleString("pt-BR"), sub: "validados", href: "/dashboard/leads", icon: MessageCircle, cor: "green" },
    { label: "Mensagens enviadas", value: enviados.toLocaleString("pt-BR"), href: "/dashboard/crm", icon: Send, cor: "violet" },
    { label: "Créditos", value: creditos.toLocaleString("pt-BR"), sub: "saldo total", href: "/dashboard/creditos", icon: Coins, cor: "blue" },
  ];

  const passos: {
    titulo: string;
    desc: string;
    href: string;
    icon: LucideIcon;
    feito: boolean;
  }[] = [
    { titulo: "Capte leads", desc: "Busque por nicho no Google Maps ou Instagram", href: "/dashboard/capture", icon: Radar, feito: nLeads > 0 },
    { titulo: "Conecte o WhatsApp", desc: "Ligue o número que fará os disparos", href: "/dashboard/whatsapp", icon: MessageCircle, feito: conectados > 0 },
    { titulo: "Dispare", desc: "Envie sua mensagem para a lista", href: "/dashboard/campaigns", icon: Send, feito: nCampanhas > 0 },
    { titulo: "Acompanhe no CRM", desc: "Veja o status de cada lead", href: "/dashboard/crm", icon: KanbanSquare, feito: enviados > 0 },
  ];

  const feitos = passos.filter((p) => p.feito).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão geral 👋</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Do lead ao fechamento, tudo num lugar só.</p>
        </div>
        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-400 hover:to-blue-500"
        >
          <Radar className="h-4 w-4" /> Captar leads
        </Link>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</span>
              <span
                className={clsx(
                  "grid h-9 w-9 place-items-center rounded-xl",
                  s.cor === "blue" && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  s.cor === "violet" && "bg-violet-50 text-violet-600",
                  s.cor === "amber" && "bg-amber-50 dark:bg-amber-500/10 text-amber-600",
                  s.cor === "red" && "bg-red-50 dark:bg-red-500/10 text-red-600",
                  s.cor === "green" && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                )}
              >
                <s.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{s.value}</p>
            {s.sub && <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{s.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Onboarding com progresso */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Comece por aqui</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {feitos} de {passos.length} concluídos
          </span>
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: `${(feitos / passos.length) * 100}%` }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p, i) => (
            <Link
              key={p.titulo}
              href={p.href}
              className={clsx(
                "group rounded-2xl border bg-white dark:bg-neutral-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                p.feito ? "border-blue-200" : "border-neutral-200 dark:border-neutral-800 hover:border-blue-200",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "grid h-9 w-9 place-items-center rounded-full text-sm font-bold",
                    p.feito ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  {p.feito ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <p.icon
                  className={clsx("h-5 w-5", p.feito ? "text-blue-500" : "text-neutral-300")}
                />
              </div>
              <h3 className="mt-3 flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600">
                {p.titulo}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{p.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
