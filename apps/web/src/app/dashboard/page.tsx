import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [leads, listas, campanhas, disparados] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("listas").select("*", { count: "exact", head: true }),
    supabase.from("campanhas").select("*", { count: "exact", head: true }),
    supabase.from("campanha_alvos").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Leads captados", value: leads.count ?? 0, href: "/dashboard/lists", cor: "text-emerald-600" },
    { label: "Listas", value: listas.count ?? 0, href: "/dashboard/lists", cor: "text-neutral-900" },
    { label: "Campanhas", value: campanhas.count ?? 0, href: "/dashboard/campaigns", cor: "text-neutral-900" },
    { label: "Leads disparados", value: disparados.count ?? 0, href: "/dashboard/crm", cor: "text-neutral-900" },
  ];

  const passos = [
    { n: 1, titulo: "Capte donos", desc: "Busque por segmento e traga o dono direto", href: "/dashboard/capture" },
    { n: 2, titulo: "Conecte o WhatsApp", desc: "Ligue o número que fará os disparos", href: "/dashboard/whatsapp" },
    { n: 3, titulo: "Dispare", desc: "Envie sua mensagem para a lista", href: "/dashboard/campaigns" },
    { n: 4, titulo: "Acompanhe no CRM", desc: "Veja o status de cada lead", href: "/dashboard/crm" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Visão geral 👋</h1>
      <p className="mt-1 text-neutral-500">Do lead ao fechamento, tudo num lugar só.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-neutral-300"
          >
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.cor}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-medium text-neutral-900">Como funciona</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p) => (
            <Link
              key={p.n}
              href={p.href}
              className="group rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-emerald-500/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-600">
                {p.n}
              </span>
              <h3 className="mt-3 font-medium text-neutral-900 group-hover:text-emerald-600">{p.titulo}</h3>
              <p className="mt-1 text-sm text-neutral-500">{p.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
