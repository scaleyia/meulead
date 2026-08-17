import Link from "next/link";
import { PLANOS, formatarPreco } from "@/lib/planos";

export const metadata = {
  title: "MeuLead — Ache os donos de negócio que precisam de você",
  description:
    "Capte leads de empresas por nicho e cidade, descubra quem não tem site, quem já anuncia e o nome do dono. Dispare no WhatsApp com segurança. Feito pra agências e prestadores de serviço.",
};

const PASSOS = [
  {
    n: "1",
    titulo: "Capte",
    desc: "Busque por nicho e cidade no Google Maps ou Instagram. Em minutos o sistema traz dezenas de empresas com telefone, site, nota e endereço.",
    emoji: "🎯",
  },
  {
    n: "2",
    titulo: "Qualifique",
    desc: "Veja quem NÃO tem site, quem já anuncia no Google/Meta, o nome do dono e valide o WhatsApp. O Score ranqueia os leads mais quentes pra você.",
    emoji: "🔎",
  },
  {
    n: "3",
    titulo: "Dispare",
    desc: "Envie mensagens no WhatsApp em massa com revezamento de chips (anti-bloqueio) e acompanhe cada lead no CRM. Do primeiro contato ao fechamento.",
    emoji: "💬",
  },
];

const RECURSOS = [
  { emoji: "🗺️", t: "Google Maps + Instagram", d: "Duas fontes de leads por nicho e localização — negócios locais e perfis." },
  { emoji: "🚩", t: "Detecta quem NÃO tem site", d: "O sinal de ouro: empresa sem site é cliente pronto pra você fechar." },
  { emoji: "👤", t: "Nome do dono", d: "Descobre o sócio/dono pela Receita pra você personalizar a abordagem." },
  { emoji: "📢", t: "Anuncia no Google/Meta?", d: "Saiba quem já investe em tráfego — quem tem verba e quer resultado." },
  { emoji: "✅", t: "Valida o WhatsApp", d: "Confere quais números têm WhatsApp antes de disparar. Economiza chip." },
  { emoji: "🔬", t: "Analisa o site (SEO)", d: "Mede velocidade e SEO — ache o argumento 'seu site é fraco, eu refaço'." },
  { emoji: "🔥", t: "Oportunidades + Score", d: "Ranqueia automaticamente os leads mais quentes prontos pra abordar." },
  { emoji: "🛡️", t: "Disparo anti-bloqueio", d: "Revezamento de vários números + aquecimento pra não queimar o chip." },
  { emoji: "📊", t: "CRM + Exportar CSV", d: "Acompanhe o status de cada disparo e leve seus leads pra qualquer lugar." },
];

const FAQ = [
  {
    q: "Preciso saber programar ou entender de design?",
    a: "Não. É só escolher o nicho e a cidade — o sistema faz a busca, a qualificação e organiza tudo pra você.",
  },
  {
    q: "De onde vêm os leads?",
    a: "De fontes públicas: Google Maps (negócios locais) e Instagram (perfis por nicho). Você busca por segmento e região.",
  },
  {
    q: "É seguro pro meu WhatsApp?",
    a: "Sim. O disparo reveza entre vários números e usa intervalos seguros + aquecimento pra reduzir o risco de bloqueio.",
  },
  {
    q: "Funciona pro meu nicho?",
    a: "Qualquer nicho: farmácias, clínicas, restaurantes, academias, pet shops, estética, oficinas — é só digitar.",
  },
  {
    q: "1 crédito é 1 lead?",
    a: "Isso. Cada lead captado usa 1 crédito. Import manual/CSV não gasta. E se um número não tiver WhatsApp, o crédito volta pra você.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade. Comece no plano grátis e faça upgrade só quando precisar de mais leads.",
  },
];

export default function LpPage() {
  const planos = PLANOS;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* brilho de fundo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/lp" className="text-lg font-bold tracking-tight">
            Meu<span className="text-emerald-400">Lead</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-neutral-300 md:flex">
            <a href="#como" className="hover:text-white">Como funciona</a>
            <a href="#recursos" className="hover:text-white">Recursos</a>
            <a href="#planos" className="hover:text-white">Planos</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-neutral-300 hover:text-white">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          🎯 Feito pra agências e prestadores de serviço
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          Ache os <span className="text-emerald-400">donos de negócio</span> que precisam de você — em minutos
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300">
          Capte empresas por nicho e cidade, descubra <strong className="text-white">quem não tem site</strong>,
          quem <strong className="text-white">já anuncia</strong> e o <strong className="text-white">nome do dono</strong>.
          Depois dispare no WhatsApp com segurança.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            Começar grátis →
          </Link>
          <a
            href="#como"
            className="rounded-full border border-white/15 px-7 py-3.5 text-base font-medium text-neutral-200 transition hover:bg-white/5"
          >
            Ver como funciona
          </a>
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          Sem cartão · 10 leads grátis pra testar
        </p>

        {/* mock de leads */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2">Oportunidades · 🔥 3 quentes prontos pra abordar</span>
          </div>
          {[
            { e: "CERTA Farmácia de Manipulação", d: "Liliamaura Gonçalves", tags: ["Sem site", "Já anuncia", "1.039 avaliações"], hot: true },
            { e: "Alquimia Farmácia de Manipulação", d: null, tags: ["Sem site", "WhatsApp ✓"], hot: true },
            { e: "R.Pharma - Farmácia de Manipulação", d: "Andreia Jurca", tags: ["Site fraco · 42", "Dono identificado"], hot: false },
          ].map((l) => (
            <div key={l.e} className="flex items-center justify-between gap-3 border-t border-white/5 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{l.e}</p>
                {l.d && <p className="text-xs text-emerald-400">👤 {l.d}</p>}
                <div className="mt-1 flex flex-wrap gap-1">
                  {l.tags.map((t) => (
                    <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                  l.hot ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {l.hot ? "🔥 Quente" : "🟡 Morno"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Em 3 passos</h2>
          <p className="mt-3 text-neutral-400">Do lead ao fechamento, num lugar só.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PASSOS.map((p) => (
            <div key={p.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 font-bold text-white">
                  {p.n}
                </span>
                <span className="text-2xl">{p.emoji}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo pra qualificar e fechar
          </h2>
          <p className="mt-3 text-neutral-400">
            Não é só uma lista de contatos — é inteligência de prospecção.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <div
              key={r.t}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.07]"
            >
              <div className="text-2xl">{r.emoji}</div>
              <h3 className="mt-3 font-semibold text-white">{r.t}</h3>
              <p className="mt-1 text-sm text-neutral-400">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAÇA AS CONTAS */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-8 sm:p-12">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Faça as contas</h2>
          <p className="mt-3 text-center text-neutral-400">
            Quanto custa prospectar do jeito antigo?
          </p>
          <div className="mx-auto mt-8 max-w-md space-y-3 text-sm">
            {[
              ["Comprar lista fria (cara e desatualizada)", "R$ 300+"],
              ["Horas garimpando no Google/Insta na mão", "seu tempo"],
              ["Ferramenta de disparo em massa", "R$ 100+/mês"],
              ["Estagiário pra qualificar lead a lead", "R$ 1.000+/mês"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-white/5 pb-2 text-neutral-300">
                <span>{k}</span>
                <span className="font-medium text-neutral-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-lg text-neutral-300">
            No MeuLead, tudo junto <strong className="text-emerald-400">a partir de R$ 97/mês</strong>.
          </p>
          <div className="mt-6 text-center">
            <a href="#planos" className="rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400">
              Ver planos
            </a>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planos que crescem com você</h2>
          <p className="mt-3 text-neutral-400">Comece grátis. Suba quando quiser mais leads.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {planos.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                p.destaque
                  ? "border-emerald-500/50 bg-emerald-500/[0.08]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {p.destaque && (
                <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Mais popular
                </span>
              )}
              <h3 className="font-semibold text-white">{p.nome}</h3>
              <p className="text-xs text-neutral-400">{p.resumo}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{formatarPreco(p.preco)}</span>
                {p.preco > 0 && <span className="text-sm text-neutral-400">/mês</span>}
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-300">
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.destaque
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-white/15 text-white hover:bg-white/10"
                }`}
              >
                {p.preco === 0 ? "Começar grátis" : "Assinar"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dúvidas</h2>
          <p className="mt-3 text-neutral-400">Perguntas frequentes</p>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between font-medium text-white">
                {f.q}
                <span className="text-emerald-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-10 sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comece a prospectar do jeito certo
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-300">
            Crie sua conta grátis e traga seus primeiros 10 leads agora — sem cartão.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              Começar grátis →
            </Link>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Acesso imediato · leads em minutos</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row">
          <span className="font-bold text-white">
            Meu<span className="text-emerald-400">Lead</span>
          </span>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/descubra" className="hover:text-white">Descubra</Link>
            <Link href="/planos" className="hover:text-white">Planos</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link href="/termos" className="hover:text-white">Termos</Link>
            <Link href="/login" className="hover:text-white">Entrar</Link>
          </div>
          <span>© {new Date().getFullYear()} MeuLead</span>
        </div>
      </footer>
    </main>
  );
}
