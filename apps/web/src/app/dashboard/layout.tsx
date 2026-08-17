import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardTour } from "@/components/DashboardTour";
import { getActiveOrg } from "@/lib/org";
import { garantirCreditos } from "@/lib/creditos";
import { isAdmin } from "@/lib/admin";
import { logout } from "../(auth)/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const org = await getActiveOrg();
  if (!org) redirect("/login");

  const saldo = await garantirCreditos(org);
  const ehFree = org.plano === "free";
  const diasReset = Math.max(
    0,
    Math.ceil((new Date(org.creditosRenovamEm).getTime() - Date.now()) / 86_400_000),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-neutral-900">
      {ehFree && (
        <Link
          href="/planos"
          className="group flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-1.5 text-center text-xs font-medium text-white transition hover:from-amber-500 hover:to-amber-500"
        >
          <span>
            ⚡ Plano Free — restam <strong>{saldo.toLocaleString("pt-BR")}</strong>{" "}
            {saldo === 1 ? "busca" : "buscas"}
          </span>
          <span className="opacity-70">·</span>
          <span>
            renova em <strong>{diasReset}</strong> {diasReset === 1 ? "dia" : "dias"}
          </span>
          <span className="ml-1 inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 font-semibold transition group-hover:bg-white/30">
            Fazer upgrade →
          </span>
        </Link>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar isAdmin={isAdmin(org.email)} />

        <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-end border-b border-neutral-200 bg-white/70 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard/creditos"
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 hover:bg-amber-500/20"
              title="Ver créditos"
            >
              ⚡ {saldo.toLocaleString("pt-BR")} créditos
            </Link>
            <a
              href="/planos"
              target="_blank"
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-700 hover:bg-emerald-500/20"
              title="Ver planos"
            >
              Plano {org.plano}
            </a>
            <span className="text-neutral-500">{org.email}</span>
            <form action={logout}>
              <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-800 transition hover:bg-neutral-100">
                Sair
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="anim-in h-full">{children}</div>
        </main>
        </div>
      </div>

      {/* Tour guiado (auto-inicia só na 1ª visita) */}
      <DashboardTour />
    </div>
  );
}
