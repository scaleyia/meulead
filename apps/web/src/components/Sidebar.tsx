"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  ready: boolean;
  adminOnly?: boolean;
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: "▚", ready: true },
  { href: "/dashboard/lists", label: "Listas de Leads", icon: "☰", ready: true },
  { href: "/dashboard/capture", label: "Captação (Apify)", icon: "🕷", ready: true },
  { href: "/dashboard/campaigns", label: "Disparador", icon: "➤", ready: true },
  { href: "/dashboard/crm", label: "CRM (status dos leads)", icon: "▦", ready: true },
  { href: "/dashboard/whatsapp", label: "Conectar WhatsApp", icon: "✆", ready: true },
  { href: "/dashboard/creditos", label: "Créditos", icon: "⚡", ready: true },
  { href: "/dashboard/interessados", label: "Interessados (marketing)", icon: "🧲", ready: true, adminOnly: true },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const itens = nav.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 p-4">
      <Link href="/dashboard" className="mb-6 block px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MeuLead" className="h-auto w-full max-w-[180px]" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {itens.map((item) => {
          const active =
            item.ready &&
            (item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href));

          if (!item.ready) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-600"
                title="Em breve"
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-700">
                  breve
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-emerald-500/10 font-medium text-emerald-400"
                  : "text-neutral-300 hover:bg-neutral-900",
              )}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
