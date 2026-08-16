import Link from "next/link";
import { DescubraForm } from "./DescubraForm";

export const metadata = {
  title: "Descubra quantos donos existem na sua região | MeuLead",
  description:
    "Veja quantos donos de empresa existem no seu segmento e estado — e comece a prospectar falando direto com o dono.",
};

export default function DescubraPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">
          Meu<span className="text-emerald-600">Lead</span>
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/planos" className="text-neutral-500 hover:text-neutral-900">
            Planos
          </Link>
          <Link href="/login" className="text-neutral-500 hover:text-neutral-900">
            Entrar
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
        <div>
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
            Grátis · sem cartão
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            Descubra quantos <span className="text-emerald-600">donos de empresa</span> existem na sua
            região
          </h1>
          <p className="mt-4 text-lg text-neutral-700">
            Pare de falar com o número da recepção. Veja o tamanho do seu mercado e receba uma
            amostra de contatos <strong>direto do dono</strong> — nome, WhatsApp e e-mail.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-700">
            {[
              "Leads de donos por segmento e estado",
              "Dispare no WhatsApp com segurança (anti-bloqueio)",
              "CRM que mostra o status de cada disparo",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <DescubraForm />
          <p className="mt-3 text-center text-xs text-neutral-400">
            Seus dados são usados apenas para enviar sua amostra. Sem spam.
          </p>
        </div>
      </section>
    </main>
  );
}
