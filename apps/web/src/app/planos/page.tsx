import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import PlanosClient from "./PlanosClient";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata = {
  title: "Planos",
  description: "Escolha o plano do MeuLead: capte donos, dispare com segurança e acompanhe no CRM.",
};

export default function PlanosPage() {
  return (
    <main className={`${jakarta.className} min-h-screen bg-white text-neutral-900`}>
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
          <br />
          No plano anual você economiza {Math.round(0.35 * 100)}% — parcelado em 12x ou à vista no Pix.
        </p>

        <PlanosClient />

        <p className="mt-8 text-sm text-neutral-500">
          Comece grátis e faça upgrade quando quiser — a assinatura é na hora, com pagamento seguro
          via Stripe. Os créditos e recursos liberam automaticamente assim que o pagamento é
          confirmado.
        </p>
      </section>
    </main>
  );
}
