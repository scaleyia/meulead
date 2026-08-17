import type { Json } from "@meulead/db";
import { createClient } from "@/lib/supabase/server";
import { saldoDaOrg } from "@/lib/creditos";
import { statusRun, itensDataset } from "@/lib/apify";
import {
  iniciarDiscoveryDonos,
  resolverDiscovery,
  construirIndice,
  acharDono,
  cidadeUfDeEnderecos,
  resolverMunicipio,
} from "@/lib/cnpjApify";
import { resolverAdsGoogle, resolverAdsMeta } from "@/lib/ads";

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
  foto_perfil: string | null;
  bio: string | null;
  verificado: boolean | null;
  posts: number | null;
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
        foto_perfil: null,
        bio: null,
        verificado: null,
        posts: null,
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
      const fb = (it.facebookPage ?? {}) as Record<string, unknown>;
      return {
        empresa: str(it.fullName) ?? username,
        nome: str(it.fullName),
        telefone: telefoneDeTexto(bio),
        email: emailDeTexto(bio),
        website: str(it.externalUrl),
        instagram: str(it.url) ?? (username ? `https://instagram.com/${username}` : null),
        seguidores: num(it.followersCount),
        nota: null,
        total_avaliacoes: null,
        endereco: null,
        categoria: str(it.businessCategoryName) ?? str(fb.category),
        foto_perfil: str(it.profilePicUrlHD) ?? str(it.profilePicUrl),
        bio,
        verificado: typeof it.verified === "boolean" ? it.verified : null,
        posts: num(it.postsCount),
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

// Quantas listas ainda estão buscando o dono (discovery pendente/rodando).
export async function donosPendentes(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("listas")
    .select("id", { count: "exact", head: true })
    .eq("organizacao_id", orgId)
    .eq("origem", "google_maps")
    .eq("dono_processado", false);
  return count ?? 0;
}

// Enriquece o dono por LISTA, via discovery da Receita (CNAE + município).
// (1) resolve discoveries que terminaram e casa os leads; (2) inicia o discovery
// de uma lista pendente (cujo Google Maps já concluiu). Roda a cada refresh.
export async function enriquecerDonos(orgId: string): Promise<void> {
  const supabase = await createClient();

  // (1) Resolve discoveries em andamento.
  const { data: rodando } = await supabase
    .from("listas")
    .select("id, dono_run_id")
    .eq("organizacao_id", orgId)
    .not("dono_run_id", "is", null)
    .limit(3);

  for (const lista of rodando ?? []) {
    if (!lista.dono_run_id) continue;
    const r = await resolverDiscovery(lista.dono_run_id);
    if (!r.done) continue;
    if (r.itens.length) {
      const indice = construirIndice(r.itens);
      const { data: leads } = await supabase
        .from("leads")
        .select("id, telefone, empresa")
        .eq("lista_id", lista.id)
        .is("nome", null);
      for (const lead of leads ?? []) {
        const dono = acharDono(indice, lead.telefone, lead.empresa);
        if (dono) await supabase.from("leads").update({ nome: dono }).eq("id", lead.id);
      }
    }
    await supabase
      .from("listas")
      .update({ dono_run_id: null, dono_processado: true })
      .eq("id", lista.id);
  }

  // (2) Inicia o discovery de UMA lista pendente (com CNAE + leads importados).
  const { data: candidatas } = await supabase
    .from("listas")
    .select("id, cnae, uf, municipio_ibge")
    .eq("organizacao_id", orgId)
    .eq("origem", "google_maps")
    .eq("dono_processado", false)
    .is("dono_run_id", null)
    .not("cnae", "is", null)
    .limit(5);

  for (const lista of candidatas ?? []) {
    // Só depois do Google Maps concluir (senão não há leads pra casar).
    const { data: job } = await supabase
      .from("jobs_apify")
      .select("status")
      .eq("lista_id", lista.id)
      .maybeSingle();
    if (job?.status !== "concluido") continue;

    const { data: leads } = await supabase
      .from("leads")
      .select("id, endereco, nome")
      .eq("lista_id", lista.id);
    const pendentes = (leads ?? []).filter((l) => !l.nome);
    if (!pendentes.length) {
      await supabase.from("listas").update({ dono_processado: true }).eq("id", lista.id);
      continue;
    }

    // Descobre cidade/UF: usa o que já está na lista OU extrai dos endereços.
    let uf = lista.uf;
    let municipio = lista.municipio_ibge;
    if (!uf || !municipio) {
      const local = cidadeUfDeEnderecos((leads ?? []).map((l) => l.endereco));
      if (local) {
        uf = local.uf;
        municipio = await resolverMunicipio(local.cidade, local.uf);
      }
    }
    if (!uf || !municipio) {
      // Não deu pra localizar — encerra sem enriquecer.
      await supabase.from("listas").update({ dono_processado: true }).eq("id", lista.id);
      continue;
    }

    const runId = await iniciarDiscoveryDonos(lista.cnae!, uf, municipio);
    if (runId) {
      await supabase
        .from("listas")
        .update({ dono_run_id: runId, uf, municipio_ibge: municipio })
        .eq("id", lista.id);
    } else {
      await supabase.from("listas").update({ dono_processado: true }).eq("id", lista.id);
    }
    break; // uma por vez
  }
}

// Quantos leads estão com verificação de anúncios em andamento.
export async function adsPendentes(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organizacao_id", orgId)
    .or("ads_run_google.not.is.null,ads_run_meta.not.is.null");
  return count ?? 0;
}

// Resolve as verificações de anúncios que já terminaram no Apify.
export async function resolverAnuncios(orgId: string, limite = 8): Promise<void> {
  const supabase = await createClient();
  const { data: pendentes } = await supabase
    .from("leads")
    .select("id, empresa, website, ads_run_google, ads_run_meta")
    .eq("organizacao_id", orgId)
    .or("ads_run_google.not.is.null,ads_run_meta.not.is.null")
    .limit(limite);

  if (!pendentes?.length) return;

  for (const lead of pendentes) {
    const empresa = lead.empresa ?? "";
    const patch: {
      anuncia_google?: boolean;
      ads_run_google?: string | null;
      anuncia_meta?: boolean;
      ads_run_meta?: string | null;
    } = {};

    if (lead.ads_run_google) {
      const r = await resolverAdsGoogle(lead.ads_run_google, empresa, lead.website);
      if (r.done) {
        patch.anuncia_google = r.anuncia;
        patch.ads_run_google = null;
      }
    }
    if (lead.ads_run_meta) {
      const r = await resolverAdsMeta(lead.ads_run_meta, empresa);
      if (r.done) {
        patch.anuncia_meta = r.anuncia;
        patch.ads_run_meta = null;
      }
    }
    if (Object.keys(patch).length) {
      await supabase.from("leads").update(patch).eq("id", lead.id);
    }
  }
}
