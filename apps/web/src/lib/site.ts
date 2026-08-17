// Análise rápida de site (qualidade + SEO básico), sem API externa.
// Busca o HTML, mede o tempo de carga e checa sinais de SEO.

export interface AnaliseSite {
  score: number; // 0-100
  cargaMs: number;
  problemas: string[];
}

function href(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function analisarSite(urlBruta: string): Promise<AnaliseSite | null> {
  const url = href(urlBruta.trim());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  const inicio = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (MeuLead SiteCheck)" },
      cache: "no-store",
    });
    const cargaMs = Date.now() - inicio;
    const finalUrl = res.url || url;
    const html = (await res.text()).slice(0, 200_000).toLowerCase();

    const problemas: string[] = [];
    let pontos = 0;
    const max = 6;

    // HTTPS
    if (finalUrl.startsWith("https://")) pontos++;
    else problemas.push("Sem HTTPS (site inseguro)");

    // Título
    const title = html.match(/<title[^>]*>([^<]{1,200})<\/title>/);
    if (title && title[1].trim().length >= 10) pontos++;
    else problemas.push("Sem título (SEO)");

    // Meta description
    if (/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i.test(html)) pontos++;
    else problemas.push("Sem meta descrição (SEO)");

    // Mobile / viewport
    if (/<meta[^>]+name=["']viewport["']/i.test(html)) pontos++;
    else problemas.push("Não é mobile-friendly");

    // H1
    if (/<h1[\s>]/i.test(html)) pontos++;
    else problemas.push("Sem H1");

    // Velocidade
    if (cargaMs <= 2500) pontos++;
    else problemas.push(`Site lento (${(cargaMs / 1000).toFixed(1)}s)`);

    const score = Math.round((pontos / max) * 100);
    return { score, cargaMs, problemas };
  } catch {
    clearTimeout(timer);
    // Não carregou (timeout/erro) — site problemático.
    return { score: 0, cargaMs: Date.now() - inicio, problemas: ["Site não carregou / fora do ar"] };
  } finally {
    clearTimeout(timer);
  }
}
