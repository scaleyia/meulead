import Link from "next/link";
import { PLANOS, formatarPreco } from "@/lib/planos";

export const metadata = {
  title: "Planos",
  description: "Escolha o plano do MeuLead: capte donos, dispare com segurança e acompanhe no CRM.",
};

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/descubra">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MeuLead" className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/descubra" className="text-neutral-500 hover:text-neutral-900">
            Descobrir leads
          </Link>
          <Link href="/login" className="text-neutral-500 hover:text-neutral-900">
            Entrar
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 text-center lg:py-14">
        <h1 className="text-3xl font-bold sm:text-4xl">Planos que crescem com você</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-500">
          Comece grátis. Suba de plano quando quiser mais leads, mais números e mais disparos.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {PLANOS.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-6 text-left ${
                p.destaque
                  ? "border-emerald-500/50 bg-emerald-500/[0.06] shadow-xl shadow-emerald-500/5"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              {p.destaque && (
                <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Mais popular
                </span>
              )}
              <h2 className="font-semibold text-neutral-900">{p.nome}</h2>
              <p className="text-xs text-neutral-500">{p.resumo}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-neutral-900">{formatarPreco(p.preco)}</span>
                {p.preco > 0 && <span className="text-sm text-neutral-500">/mês</span>}
              </div>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-700">
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.destaque
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                {p.preco === 0 ? "Começar grátis" : "Assinar"}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          Comece grátis e faça upgrade quando quiser — a assinatura é na hora, com pagamento seguro
          via Stripe. Os créditos e recursos liberam automaticamente assim que o pagamento é
          confirmado.
        </p>
      </section>
    </main>
  );
}
