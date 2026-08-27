import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { DashboardTour } from "@/components/DashboardTour";
import { getActiveOrg } from "@/lib/org";
import { garantirCreditos } from "@/lib/creditos";
import { isAdmin } from "@/lib/admin";
import { logout } from "../(auth)/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const org = await getActiveOrg();

  // O proxy já garante que só usuário logado chega aqui. Se mesmo assim a org
  // vier nula (ex: sem organização vinculada), NÃO redireciona pro /login —
  // isso causaria loop com o proxy. Mostra um aviso com opção de sair.
  if (!org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
        <h1 className="text-xl font-semibold">Não encontramos sua organização</h1>
        <p className="max-w-md text-sm text-neutral-500">
          Sua conta está autenticada, mas não achamos os dados da organização. Recarregue a página
          ou saia e entre novamente.
        </p>
        <div className="flex gap-3">
          <a href="/dashboard" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
            Recarregar
          </a>
          <form action={logout}>
            <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
              Sair
            </button>
          </form>
        </div>
      </div>
    );
  }

  const saldo = await garantirCreditos(org);
  const ehFree = org.plano === "free";
  const diasReset = Math.max(
    0,
    Math.ceil((new Date(org.creditosRenovamEm).getTime() - Date.now()) / 86_400_000),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {ehFree && (
        <Link
          href="/dashboard/creditos#assinar"
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
        <Sidebar isAdmin={isAdmin(org.email)} userEmail={org.email} plano={org.plano} />

        <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-end border-b border-neutral-200 bg-white/70 px-6 py-3 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard/creditos"
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 hover:bg-amber-500/20"
              title="Ver créditos"
            >
              ⚡ {saldo.toLocaleString("pt-BR")} créditos
            </Link>
            <Link
              href="/dashboard/creditos#assinar"
              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 hover:bg-blue-500/20"
              title="Ver e assinar planos"
            >
              Plano {org.plano}
            </Link>
            <span className="text-neutral-500 dark:text-neutral-400">{org.email}</span>
            <form action={logout}>
              <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
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
