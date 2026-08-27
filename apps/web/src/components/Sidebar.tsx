"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderClosed,
  Radar,
  Send,
  KanbanSquare,
  Target,
  MessageCircle,
  Coins,
  Magnet,
  ArrowUpCircle,
  Moon,
  Sun,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "@/lib/clsx";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
  adminOnly?: boolean;
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, ready: true },
  { href: "/dashboard/leads", label: "Leads", icon: Users, ready: true },
  { href: "/dashboard/lists", label: "Listas", icon: FolderClosed, ready: true },
  { href: "/dashboard/capture", label: "Captação", icon: Radar, ready: true },
  { href: "/dashboard/campaigns", label: "Disparos", icon: Send, ready: true },
  { href: "/dashboard/crm", label: "CRM", icon: KanbanSquare, ready: true },
  { href: "/dashboard/oportunidades", label: "Oportunidades", icon: Target, ready: true },
  { href: "/dashboard/whatsapp", label: "Conexões", icon: MessageCircle, ready: true },
  { href: "/dashboard/creditos", label: "Créditos", icon: Coins, ready: true },
  { href: "/dashboard/interessados", label: "Interessados", icon: Magnet, ready: true, adminOnly: true },
];

export function Sidebar({
  isAdmin = false,
  userEmail = "",
  plano = "free",
}: {
  isAdmin?: boolean;
  userEmail?: string;
  plano?: string;
}) {
  const pathname = usePathname();
  const itens = nav.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white/70 p-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70">
      <Link href="/dashboard" className="mb-6 flex justify-center transition-transform hover:scale-[1.03]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MeuLead" className="h-28 w-28 rounded-2xl" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {itens.map((item) => {
          const active =
            item.ready &&
            (item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href));
          const Icon = item.icon;

          if (!item.ready) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 dark:text-neutral-500"
                title="Em breve"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  breve
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              data-tour={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-blue-50 font-semibold text-blue-700 shadow-sm ring-1 ring-blue-500/15 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              )}
            >
              <Icon
                className={clsx(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300",
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SidebarFooter userEmail={userEmail} plano={plano} />
    </aside>
  );
}

function SidebarFooter({ userEmail, plano }: { userEmail: string; plano: string }) {
  // Tema: lê a classe já aplicada pelo script anti-flash no <html>.
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  const inicial = (userEmail.trim()[0] || "?").toUpperCase();

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      {/* Fazer upgrade */}
      <UpgradeDialog
        planoAtual={plano ?? "free"}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:from-blue-400 hover:to-blue-500 active:scale-[0.98]"
      >
        <ArrowUpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
        Fazer upgrade
      </UpgradeDialog>

      {/* Lua (dark mode) + engrenagem + avatar */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? "Modo claro" : "Modo escuro"}
          title={dark ? "Modo claro" : "Modo escuro"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {dark ? <Sun className="h-5 w-5" strokeWidth={1.75} /> : <Moon className="h-5 w-5" strokeWidth={1.75} />}
        </button>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/creditos"
            aria-label="Configurações"
            title="Configurações"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <div
            title={`${userEmail}${plano ? ` · plano ${plano}` : ""}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white dark:bg-neutral-600"
          >
            {inicial}
          </div>
        </div>
      </div>
    </div>
  );
}
