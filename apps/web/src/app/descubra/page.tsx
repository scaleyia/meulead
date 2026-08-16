import Link from "next/link";
import { DescubraForm } from "./DescubraForm";

export const metadata = {
  title: "Descubra quantos donos existem na sua região | MeuLead",
  description:
    "Veja quantos donos de empresa existem no seu segmento e estado — e comece a prospectar falando direto com o dono.",
};

export default function DescubraPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">
          Meu<span className="text-emerald-400">Lead</span>
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/planos" className="text-neutral-400 hover:text-white">
            Planos
          </Link>
          <Link href="/login" className="text-neutral-400 hover:text-white">
            Entrar
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
        <div>
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Grátis · sem cartão
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            Descubra quantos <span className="text-emerald-400">donos de empresa</span> existem na sua
            região
          </h1>
          <p className="mt-4 text-lg text-neutral-300">
            Pare de falar com o número da recepção. Veja o tamanho do seu mercado e receba uma
            amostra de contatos <strong>direto do dono</strong> — nome, WhatsApp e e-mail.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-300">
            {[
              "Leads de donos por segmento e estado",
              "Dispare no WhatsApp com segurança (anti-bloqueio)",
              "CRM que mostra o status de cada disparo",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <DescubraForm />
          <p className="mt-3 text-center text-xs text-neutral-600">
            Seus dados são usados apenas para enviar sua amostra. Sem spam.
          </p>
        </div>
      </section>
    </main>
  );
}
