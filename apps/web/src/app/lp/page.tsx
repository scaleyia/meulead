import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Reveal, ScrollProgress, Tilt } from "@/components/lp/Effects";
import { WhatsappFab } from "@/components/WhatsappFab";
import LpPlanos from "./LpPlanos";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata = {
  title: "MeuLead — Ache os donos de negócio que precisam de você",
  description:
    "Capte leads de empresas por nicho e cidade, descubra quem não tem site, quem já anuncia e o nome do dono. Dispare no WhatsApp com segurança.",
};

const NICHOS = ["Farmácias","Clínicas","Restaurantes","Academias","Pet shops","Estética","Advogados","Dentistas","Oficinas","Imobiliárias","Barbearias","Contadores"];

// Cards da galeria inclinada (hero)
const GALERIA = [
  { e: "Cantina da Nonna", d: "Marina Bianchi", tags: ["Sem site", "Já anuncia"], hot: "🔥 Quente" },
  { e: "PowerFit Academia", d: null, tags: ["Sem site", "WhatsApp ✓"], hot: "🔥 Quente" },
  { e: "Clínica OdontoVida", d: "Andreia Jurca", tags: ["Site fraco · 42", "Dono ✓"], hot: "🟡 Morno" },
  { e: "Patas & Cia Pet Shop", d: "Creusa Toledo", tags: ["118 avaliações", "Anuncia"], hot: "🔥 Quente" },
  { e: "Studio Bella Estética", d: "Carolini Mazza", tags: ["Sem site", "Dono ✓"], hot: "🔥 Quente" },
  { e: "Oficina do Zé", d: "Roberto Alves", tags: ["Sem site", "WhatsApp ✓"], hot: "🟡 Morno" },
  { e: "Advocacia Menezes", d: "Paula Menezes", tags: ["Site fraco · 51", "Dono ✓"], hot: "🔥 Quente" },
];

const REACOES = [
  { bolha: "Sem site? 🎯", cor: "text-red-500", desc: "Marca quem não tem site — sua melhor porta de entrada." },
  { bolha: "Achei o dono! 👤", cor: "text-blue-700", desc: "Traz o nome do dono, não um telefone genérico." },
  { bolha: "Esse é quente! 🔥", cor: "text-amber-500", desc: "Prioriza os leads com maior chance de fechar." },
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
  "inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-4 text-base font-semibold text-white shadow-[0_16px_44px_-10px_rgba(37,99,235,0.7)] transition hover:scale-[1.03] hover:brightness-110";

// Faixas de fundo alternadas (full-width) — discretas, com gradiente suave.
const BAND_HERO = "bg-gradient-to-b from-blue-50/70 via-white to-white";
const BAND_SOFT = "bg-gradient-to-b from-slate-50 via-white to-slate-50";
const BAND_BLUE = "bg-gradient-to-b from-white via-slate-50 to-blue-50/50";

export default function LpPage() {
  return (
    <main className={`${jakarta.className} min-h-screen overflow-x-hidden bg-white text-neutral-900`}>
      <ScrollProgress />

      {/* TOPO FIXO: barra de aviso + nav (ficam grudados no topo no scroll) */}
      <div className="sticky top-0 z-40">
        {/* BARRA DE AVISO */}
        <div className="w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600 px-4 py-2 text-center text-sm font-medium text-white">
          📈 O MeuLead acha os donos de negócio que precisam de você — capte, qualifique e dispare em minutos!
        </div>

        {/* NAV */}
        <header className="border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl">
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
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 font-semibold text-white shadow-sm transition hover:brightness-110">
              Começar agora <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs">›</span>
            </Link>
          </div>
        </div>
        </header>
      </div>

      {/* fundo com leve wash no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-gradient-to-b from-blue-50 via-white to-white" />

      {/* HERO + GALERIA (faixa com gradiente) */}
      <div className={BAND_HERO}>
      {/* HERO centralizado */}
      <section className="mx-auto max-w-4xl px-6 pt-14 text-center sm:pt-20">
        <Reveal>
          <h1 className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            Ache os{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">donos de negócio</span>{" "}
            que <span className="text-blue-700">precisam de você</span> em minutos.
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
                {[
                  "https://randomuser.me/api/portraits/women/44.jpg",
                  "https://randomuser.me/api/portraits/men/32.jpg",
                  "https://randomuser.me/api/portraits/women/68.jpg",
                  "https://randomuser.me/api/portraits/men/75.jpg",
                  "https://randomuser.me/api/portraits/women/90.jpg",
                ].map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="Cliente do MeuLead" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
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

      {/* GALERIA — vitrine de oportunidades (marquee horizontal) */}
      <div className="relative mt-16 overflow-hidden py-6">
        <div className="lp-marquee flex w-max gap-4 px-6">
          {[...GALERIA, ...GALERIA].map((c, i) => (
            <div
              key={i}
              className="w-64 shrink-0 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-xl shadow-neutral-900/[0.06]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">Oportunidade</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.hot.includes("Quente") ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600"}`}>{c.hot}</span>
              </div>
              <p className="mt-2.5 text-sm font-semibold text-neutral-900">{c.e}</p>
              {c.d && <p className="mt-0.5 text-xs font-medium text-blue-700">👤 {c.d}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* fade nas laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent sm:w-32" />
      </div>
      </div>

      {/* MARQUEE */}
      <div className="relative overflow-hidden border-y border-neutral-200 bg-neutral-50 py-4">
        <div className="lp-marquee flex w-max gap-3">
          {[...NICHOS, ...NICHOS].map((n, i) => (
            <span key={i} className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600">{n}</span>
          ))}
        </div>
      </div>

      {/* SEU DETETIVE DE LEADS (faixa) */}
      <div className={BAND_SOFT}>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <Reveal>
            <div className="relative flex justify-center">
              <div className="pointer-events-none absolute inset-0 m-auto h-56 w-56 rounded-full bg-blue-600/15 blur-[80px]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascote.png" alt="Detetive de leads do MeuLead" className="lp-float relative w-52 drop-shadow-[0_16px_40px_rgba(37,99,235,0.25)] sm:w-64" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Seu detetive de leads, trabalhando por você 🔎</h2>
              <p className="mt-3 text-neutral-500">Ele vasculha, qualifica e te entrega só o que importa — sem você perder tempo.</p>
              <ul className="mt-6 space-y-3">
                {REACOES.map((r) => (
                  <li key={r.bolha} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <span className={`shrink-0 text-sm font-semibold ${r.cor}`}>{r.bolha}</span>
                    <span className="text-sm text-neutral-600">{r.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
      </div>

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
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-white">{p.n}</span>
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

      {/* RECURSOS (faixa) */}
      <div className={BAND_SOFT}>
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
              <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg">
                <div className="text-2xl transition group-hover:scale-110">{r.emoji}</div>
                <h3 className="mt-3 font-semibold text-neutral-900">{r.t}</h3>
                <p className="mt-1 text-sm text-neutral-500">{r.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      </div>

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
              No MeuLead, tudo junto <strong className="text-blue-700">a partir de R$ 97/mês</strong>.
            </p>
            <div className="mt-6 text-center">
              <a href="#planos" className={CTA_PILL}>Ver planos</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PLANOS (faixa azul suave) */}
      <div className={BAND_BLUE}>
      <section id="planos" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planos que crescem com você</h2>
            <p className="mt-3 text-neutral-500">Comece grátis. No plano anual você economiza {Math.round(0.35 * 100)}% — 12x ou à vista no Pix.</p>
          </div>
        </Reveal>
        <LpPlanos />
      </section>
      </div>

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
                  <span className="text-xl text-blue-600 transition group-open:rotate-45">+</span>
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
          <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-8 py-12 text-white sm:px-14 sm:py-14">
            <div className="lp-glow pointer-events-none absolute left-1/4 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-600/30 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-56 w-80 rounded-full bg-blue-500/20 blur-[100px]" />

            <div className="relative mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400">
                10 leads grátis · sem cartão
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Comece a prospectar do jeito certo</h2>
              <p className="mx-auto mt-3 max-w-xl text-neutral-300">
                Crie sua conta grátis e traga seus primeiros leads agora. Acesso imediato — leva menos de 2 minutos.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 px-7 py-3.5 text-base font-semibold text-neutral-950 shadow-[0_16px_44px_-8px_rgba(37,99,235,0.6)] transition hover:scale-[1.03] hover:brightness-110">
                  Começar grátis <span className="grid h-6 w-6 place-items-center rounded-full bg-black/15">›</span>
                </Link>
                <Link href="/planos" className="rounded-full border border-white/15 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                  Ver planos
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1.5"><span className="text-blue-500">✓</span> Acesso imediato</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-blue-500">✓</span> Leads em minutos</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-blue-500">✓</span> Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* Marca */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MeuLead" className="h-8 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
                Ache os donos de negócio que precisam de você. Capte por nicho e cidade, descubra quem
                não tem site e dispare no WhatsApp com segurança.
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Criar conta grátis <span aria-hidden>›</span>
              </Link>
            </div>

            {/* Produto */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Produto</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-500">
                <li><Link href="/descubra" className="transition hover:text-neutral-900">Descobrir leads</Link></li>
                <li><Link href="/planos" className="transition hover:text-neutral-900">Planos e preços</Link></li>
                <li><Link href="/#faq" className="transition hover:text-neutral-900">Dúvidas</Link></li>
              </ul>
            </div>

            {/* Conta */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Conta</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-500">
                <li><Link href="/login" className="transition hover:text-neutral-900">Entrar</Link></li>
                <li><Link href="/signup" className="transition hover:text-neutral-900">Criar conta</Link></li>
                <li><a href="mailto:contato@scaley.com.br" className="transition hover:text-neutral-900">Suporte</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Legal</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-500">
                <li><Link href="/privacidade" className="transition hover:text-neutral-900">Privacidade</Link></li>
                <li><Link href="/termos" className="transition hover:text-neutral-900">Termos de uso</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-500 sm:flex-row">
            <span>© {new Date().getFullYear()} MeuLead. Todos os direitos reservados.</span>
            <span className="inline-flex items-center gap-1.5">Feito no Brasil <span aria-hidden>🇧🇷</span></span>
          </div>
        </div>
      </footer>

      <WhatsappFab />
    </main>
  );
}
