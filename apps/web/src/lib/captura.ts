import type { Json } from "@meulead/db";
import { createClient } from "@/lib/supabase/server";
import { saldoDaOrg } from "@/lib/creditos";
import { statusRun, itensDataset } from "@/lib/apify";

// Lead pronto pra inserir (sem organizacao_id/lista_id, que entram no sync).
interface LeadNovo {
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  seguidores: number | null;
  nota: number | null;
  total_avaliacoes: number | null;
  endereco: string | null;
  categoria: string | null;
  origem: string;
  dados_brutos: Json;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Extrai um telefone BR de um texto livre (bio do Instagram, etc.).
function telefoneDeTexto(texto: string | null): string | null {
  if (!texto) return null;
  const m = texto.match(/(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/);
  return m ? m[0].trim() : null;
}

function emailDeTexto(texto: string | null): string | null {
  if (!texto) return null;
  const m = texto.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m ? m[0] : null;
}

// ---- Google Maps (compass~crawler-google-places) ----
function mapearGoogleMaps(itens: Record<string, unknown>[]): LeadNovo[] {
  return itens
    .map((it): LeadNovo => {
      const endereco =
        str(it.address) ??
        ([str(it.street), str(it.city), str(it.state)].filter(Boolean).join(", ") || null);
      return {
        empresa: str(it.title),
        nome: null, // Google Maps não traz o nome do dono.
        telefone: str(it.phoneUnformatted) ?? str(it.phone),
        email: null,
        website: str(it.website),
        instagram: null,
        seguidores: null,
        nota: num(it.totalScore),
        total_avaliacoes: num(it.reviewsCount),
        endereco,
        categoria: str(it.categoryName),
        origem: "google_maps",
        dados_brutos: it as Json,
      };
    })
    .filter((l) => l.telefone && l.empresa); // precisa de telefone pra disparar
}

// ---- Instagram (apify~instagram-scraper, resultsType=details) ----
function mapearInstagram(itens: Record<string, unknown>[]): LeadNovo[] {
  return itens
    .map((it): LeadNovo => {
      const username = str(it.username);
      const bio = str(it.biography);
      return {
        empresa: str(it.fullName) ?? username,
        nome: str(it.fullName),
        telefone: str(it.businessPhoneNumber) ?? telefoneDeTexto(bio),
        email: str(it.businessEmail) ?? emailDeTexto(bio),
        website: str(it.externalUrl),
        instagram: username ? `https://instagram.com/${username}` : str(it.url),
        seguidores: num(it.followersCount),
        nota: null,
        total_avaliacoes: null,
        endereco: str(it.addressStreet) ?? str(it.city),
        categoria: str(it.businessCategoryName),
        origem: "instagram",
        dados_brutos: it as Json,
      };
    })
    .filter((l) => l.instagram && l.empresa); // precisa do perfil pra contatar
}

function dedup(leads: LeadNovo[]): LeadNovo[] {
  const visto = new Set<string>();
  const out: LeadNovo[] = [];
  for (const l of leads) {
    const chave = (l.telefone ?? l.instagram ?? l.empresa ?? "").toLowerCase();
    if (!chave || visto.has(chave)) continue;
    visto.add(chave);
    out.push(l);
  }
  return out;
}

// Verifica jobs "rodando", importa os que terminaram no Apify e qualifica os leads.
// Chamado no render da página de captação (junto do AutoRefresh) — sem cron.
export async function sincronizarJobs(orgId: string): Promise<void> {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs_apify")
    .select("id, lista_id, origem, apify_run_id")
    .eq("organizacao_id", orgId)
    .eq("status", "rodando");

  if (!jobs?.length) return;

  for (const job of jobs) {
    if (!job.apify_run_id) continue;
    const run = await statusRun(job.apify_run_id);
    if (!run) continue;

    if (run.status === "SUCCEEDED") {
      const itens = await itensDataset(run.defaultDatasetId);

      // "Reivindica" o job (evita importar 2x em renders concorrentes).
      const { data: claimed } = await supabase
        .from("jobs_apify")
        .update({ status: "concluido" })
        .eq("id", job.id)
        .eq("status", "rodando")
        .select("id");
      if (!claimed?.length) continue;

      const mapped = dedup(
        job.origem === "instagram" ? mapearInstagram(itens) : mapearGoogleMaps(itens),
      );

      // Nunca importa mais leads do que o saldo cobre (1 crédito = 1 lead).
      const saldo = await saldoDaOrg(orgId);
      const paraInserir = mapped.slice(0, Math.max(0, saldo)).map((l) => ({
        ...l,
        organizacao_id: orgId,
        lista_id: job.lista_id,
      }));

      if (paraInserir.length) {
        await supabase.from("leads").insert(paraInserir);
      }
      await supabase
        .from("jobs_apify")
        .update({ resultado_count: paraInserir.length })
        .eq("id", job.id);
    } else if (["FAILED", "ABORTED", "TIMED-OUT"].includes(run.status)) {
      await supabase
        .from("jobs_apify")
        .update({ status: "erro", erro: `Apify: ${run.status}` })
        .eq("id", job.id)
        .eq("status", "rodando");
    }
    // RUNNING / READY: ainda em andamento — deixa pro próximo refresh.
  }
}
