import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { PLANOS, formatarPreco } from "@/lib/planos";
import { Reveal, ScrollProgress, Tilt } from "@/components/lp/Effects";

const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "MeuLead — Ache os donos de negócio que precisam de você",
  description:
    "Capte leads de empresas por nicho e cidade, descubra quem não tem site, quem já anuncia e o nome do dono. Dispare no WhatsApp com segurança.",
};

const NICHOS = ["Farmácias","Clínicas","Restaurantes","Academias","Pet shops","Estética","Advogados","Dentistas","Oficinas","Imobiliárias","Barbearias","Contadores"];

// Cards da galeria inclinada (hero)
const GALERIA = [
  { e: "CERTA Farmácia de Manipulação", d: "Liliamaura Gonçalves", tags: ["Sem site", "Já anuncia"], hot: "🔥 Quente" },
  { e: "Alquimia Farmácia", d: null, tags: ["Sem site", "WhatsApp ✓"], hot: "🔥 Quente" },
  { e: "R.Pharma", d: "Andreia Jurca", tags: ["Site fraco · 42", "Dono ✓"], hot: "🟡 Morno" },
  { e: "Grindélia Farmácia", d: "Creusa Toledo", tags: ["118 avaliações", "Anuncia"], hot: "🔥 Quente" },
  { e: "Única Farmácia", d: "Carolini Mazza", tags: ["Sem site", "Dono ✓"], hot: "🔥 Quente" },
];

const REACOES = [
  { bolha: "Sem site? 🎯", cor: "text-red-500", flip: false, delay: "0s" },
  { bolha: "Achei o dono! 👤", cor: "text-emerald-600", flip: true, delay: "0.6s" },
  { bolha: "Esse é quente! 🔥", cor: "text-amber-500", flip: false, delay: "1.2s" },
];

const PASSOS = [
  { n: "1", emoji: "🎯", titulo: "Capte", desc: "Busque por nicho e cidade no Google Maps ou Instagram. Em minutos, dezenas de empresas com telefone, site, nota e endereço." },
  { n: "2", emoji: "🔎", titulo: "Qualifique", desc: "Veja quem NÃO tem site, quem já anuncia, o nome do dono e valide o WhatsApp. O Score ranqueia os leads mais quentes." },
  { n: "3", emoji: "💬", titulo: "Dispare", desc: "WhatsApp em massa com revezamento de chips (anti-bloqueio) e CRM. Do primeiro contato ao fechamento." },
];

const RECURSOS = [
  { emoji: "🗺️", t: "Google Maps + Instagram", d: "Duas fontes de leads por nicho e localização." },
  { emoji: "🚩", t: "Detecta quem NÃO tem site", d: "O sinal de ouro: empresa sem site é cliente pronto." },
  { emoji: "👤", t: "Nome do dono", d: "Descobre o sócio pela Receita pra personalizar a abordagem." },
  { emoji: "📢", t: "Anuncia no Google/Meta?", d: "Saiba quem já investe em tráfego — quem tem verba." },
  { emoji: "✅", t: "Valida o WhatsApp", d: "Confere quem tem WhatsApp antes de disparar. Economiza chip." },
  { emoji: "🔬", t: "Analisa o site (SEO)", d: "Mede velocidade e SEO — ache o 'seu site é fraco, eu refaço'." },
  { emoji: "🔥", t: "Oportunidades + Score", d: "Ranqueia os leads mais quentes prontos pra abordar." },
  { emoji: "🛡️", t: "Disparo anti-bloqueio", d: "Vários números revezando + aquecimento pra não queimar." },
  { emoji: "📊", t: "CRM + Exportar CSV", d: "Status de cada disparo e seus leads em qualquer lugar." },
];

const FAQ = [
  { q: "Preciso saber programar ou entender de design?", a: "Não. É só escolher o nicho e a cidade — o sistema faz a busca, a qualificação e organiza tudo pra você." },
  { q: "De onde vêm os leads?", a: "De fontes públicas: Google Maps (negócios locais) e Instagram (perfis por nicho). Você busca por segmento e região." },
  { q: "É seguro pro meu WhatsApp?", a: "Sim. O disparo reveza entre vários números e usa intervalos seguros + aquecimento pra reduzir o risco de bloqueio." },
  { q: "Funciona pro meu nicho?", a: "Qualquer nicho: farmácias, clínicas, restaurantes, academias, pet shops, estética, oficinas — é só digitar." },
  { q: "1 crédito é 1 lead?", a: "Isso. Cada lead captado usa 1 crédito. Import manual/CSV não gasta. E se o número não tiver WhatsApp, o crédito volta pra você." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Comece grátis e faça upgrade só quando precisar de mais leads." },
];

const CTA_PILL =
  "inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-4 text-base font-semibold text-white shadow-[0_16px_44px_-10px_rgba(16,185,129,0.7)] transition hover:scale-[1.03] hover:brightness-110";

export default function LpPage() {
  return (
    <main className={`${grotesk.className} min-h-screen overflow-x-hidden bg-white text-neutral-900`}>
      <ScrollProgress />

      {/* BARRA DE AVISO no topo */}
      <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 px-4 py-2 text-center text-sm font-medium text-white">
        📈 O MeuLead acha os donos de negócio que precisam de você — capte, qualifique e dispare em minutos!
      </div>

      {/* fundo com leve wash verde no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-gradient-to-b from-emerald-50 via-white to-white" />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MeuLead" className="h-9 w-auto" />
          <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-500 md:flex">
            <a href="#planos" className="hover:text-neutral-900">Planos</a>
            <a href="#como" className="hover:text-neutral-900">Como funciona</a>
            <a href="#recursos" className="hover:text-neutral-900">Recursos</a>
            <a href="#faq" className="hover:text-neutral-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-full border border-neutral-300 px-5 py-2 font-medium text-neutral-800 transition hover:bg-neutral-50">Login</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 font-semibold text-white shadow-sm transition hover:brightness-110">
              Começar agora <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs">›</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO centralizado */}
      <section className="mx-auto max-w-4xl px-6 pt-14 text-center sm:pt-20">
        <Reveal>
          <h1 className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            Ache os{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">donos de negócio</span>{" "}
            que <span className="text-emerald-600">precisam de você</span> em minutos.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg text-neutral-500 sm:text-xl">
            O MeuLead faz o trabalho pesado: acha as empresas, mostra <strong className="text-neutral-800">quem não tem site</strong>,
            quem já anuncia e o <strong className="text-neutral-800">nome do dono</strong>.{" "}
            <strong className="text-neutral-800">Sem lista fria. Sem garimpo. Sem perder horas.</strong>
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/signup" className={CTA_PILL}>
              Quero meus leads agora
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25">›</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["from-emerald-400 to-teal-500","from-amber-400 to-orange-500","from-sky-400 to-indigo-500","from-rose-400 to-red-500","from-fuchsia-400 to-purple-500"].map((g) => (
                  <span key={g} className={`h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br ${g}`} />
                ))}
              </div>
              <div className="text-left text-xs text-neutral-500">
                <div className="text-amber-400">★★★★★</div>
                Usado por <strong className="text-neutral-700">agências</strong> que prospectam de verdade.
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* GALERIA INCLINADA (perspectiva 3D) */}
      <div className="relative mt-14 h-[340px] overflow-hidden sm:h-[420px]" style={{ perspective: "1400px" }}>
        <div
          className="mx-auto flex w-max gap-5 px-6"
          style={{ transform: "rotateX(42deg) translateY(-10px)", transformStyle: "preserve-3d" }}
        >
          {GALERIA.map((c, i) => (
            <div
              key={c.e}
              className="lp-float-slow w-56 shrink-0 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-2xl"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Oportunidade</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.hot.includes("Quente") ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600"}`}>{c.hot}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{c.e}</p>
              {c.d && <p className="text-xs font-medium text-emerald-600">👤 {c.d}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {c.tags.map((t) => (
                  <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* fade pra branco na base */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* MARQUEE */}
      <div className="relative overflow-hidden border-y border-neutral-200 bg-neutral-50 py-4">
        <div className="lp-marquee flex w-max gap-3">
          {[...NICHOS, ...NICHOS].map((n, i) => (
            <span key={i} className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600">{n}</span>
          ))}
        </div>
      </div>

      {/* REAÇÕES do mascote */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Seu detetive de leads, trabalhando por você 🔎</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {REACOES.map((r) => (
            <Reveal key={r.bolha} delay={150}>
              <div className="flex flex-col items-center">
                <span className={`mb-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold ${r.cor} shadow-md`}>{r.bolha}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascote.png" alt="MeuLead" className="lp-bob w-28 drop-shadow-[0_12px_30px_rgba(16,185,129,0.22)]" style={{ animationDelay: r.delay, transform: r.flip ? "scaleX(-1)" : undefined }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Em 3 passos</h2>
            <p className="mt-3 text-neutral-500">Do lead ao fechamento, num lugar só.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <Tilt max={6} className="h-full">
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white">{p.n}</span>
                    <span className="text-2xl">{p.emoji}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{p.desc}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo pra qualificar e fechar</h2>
            <p className="mt-3 text-neutral-500">Não é só uma lista de contatos — é inteligência de prospecção.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r, i) => (
            <Reveal key={r.t} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                <div className="text-2xl transition group-hover:scale-110">{r.emoji}</div>
                <h3 className="mt-3 font-semibold text-neutral-900">{r.t}</h3>
                <p className="mt-1 text-sm text-neutral-500">{r.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAÇA AS CONTAS */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <Reveal>
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Faça as contas</h2>
            <p className="mt-3 text-center text-neutral-500">Quanto custa prospectar do jeito antigo?</p>
            <div className="mx-auto mt-8 max-w-md space-y-3 text-sm">
              {[
                ["Comprar lista fria (cara e desatualizada)", "R$ 300+"],
                ["Horas garimpando no Google/Insta na mão", "seu tempo"],
                ["Ferramenta de disparo em massa", "R$ 100+/mês"],
                ["Estagiário pra qualificar lead a lead", "R$ 1.000+/mês"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-neutral-200 pb-2 text-neutral-600">
                  <span>{k}</span>
                  <span className="font-medium text-neutral-500">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-lg text-neutral-700">
              No MeuLead, tudo junto <strong className="text-emerald-600">a partir de R$ 97/mês</strong>.
            </p>
            <div className="mt-6 text-center">
              <a href="#planos" className={CTA_PILL}>Ver planos</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planos que crescem com você</h2>
            <p className="mt-3 text-neutral-500">Comece grátis. Suba quando quiser mais leads.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {PLANOS.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <div className={`relative flex h-full flex-col rounded-2xl border p-6 transition hover:-translate-y-1 ${p.destaque ? "border-emerald-400/60 bg-emerald-50/60 shadow-lg shadow-emerald-500/10" : "border-neutral-200 bg-white shadow-sm"}`}>
                {p.destaque && <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-0.5 text-xs font-semibold text-white">Mais popular</span>}
                <h3 className="font-semibold text-neutral-900">{p.nome}</h3>
                <p className="text-xs text-neutral-500">{p.resumo}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-neutral-900">{formatarPreco(p.preco)}</span>
                  {p.preco > 0 && <span className="text-sm text-neutral-500">/mês</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-600">
                  {p.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2"><span className="mt-0.5 text-emerald-500">✓</span><span>{r}</span></li>
                  ))}
                </ul>
                <Link href="/signup" className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${p.destaque ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110" : "border border-neutral-300 text-neutral-800 hover:bg-neutral-50"}`}>
                  {p.preco === 0 ? "Começar grátis" : "Assinar"}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dúvidas</h2>
            <p className="mt-3 text-neutral-500">Perguntas frequentes</p>
          </div>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <Reveal key={f.q}>
              <details className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between font-medium text-neutral-900">
                  {f.q}
                  <span className="text-xl text-emerald-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA FINAL (bloco escuro) */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-6 py-16 text-center text-white sm:px-16">
            <div className="lp-glow pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-[100px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascote.png" alt="" className="lp-float pointer-events-none absolute -right-4 -top-4 w-28 opacity-90 sm:w-36" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comece a prospectar do jeito certo</h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-300">Crie sua conta grátis e traga seus primeiros 10 leads agora — sem cartão.</p>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-8 py-4 text-lg font-semibold text-neutral-950 shadow-[0_16px_44px_-8px_rgba(16,185,129,0.6)] transition hover:scale-[1.03] hover:brightness-110">
                Começar grátis <span className="grid h-6 w-6 place-items-center rounded-full bg-black/15">›</span>
              </Link>
            </div>
            <p className="mt-4 text-sm text-neutral-500">Acesso imediato · leads em minutos</p>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MeuLead" className="h-8 w-auto" />
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/descubra" className="hover:text-neutral-900">Descubra</Link>
            <Link href="/planos" className="hover:text-neutral-900">Planos</Link>
            <Link href="/privacidade" className="hover:text-neutral-900">Privacidade</Link>
            <Link href="/termos" className="hover:text-neutral-900">Termos</Link>
            <Link href="/login" className="hover:text-neutral-900">Entrar</Link>
          </div>
          <span>© {new Date().getFullYear()} MeuLead</span>
        </div>
      </footer>
    </main>
  );
}
