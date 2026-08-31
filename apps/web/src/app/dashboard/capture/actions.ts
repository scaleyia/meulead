"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { saldoDaOrg } from "@/lib/creditos";
import {
  iniciarRun,
  apifyDisponivel,
  ACTOR_GOOGLE_MAPS,
  iniciarInstagramDescoberta,
} from "@/lib/apify";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface JobInput {
  origem: "google_maps" | "instagram";
  quantidade: number;
  nomeLista?: string; // nome escolhido pelo usuário (opcional)
  termoBusca: string; // termo/nicho (no IG: hashtags ou nicho do local)
  localizacao?: string; // google_maps e IG (método local)
  cnae?: string; // segmento p/ achar o dono (só google_maps)
  metodo?: "hashtag" | "local"; // só instagram
}

export async function criarJob(input: JobInput): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  if (!apifyDisponivel()) {
    return { ok: false, error: "Captação indisponível: configure o APIFY_TOKEN." };
  }

  // Bloqueio por créditos (1 crédito = 1 lead). Sem saldo, não capta.
  const saldo = await saldoDaOrg(org.orgId);
  if (saldo <= 0) {
    return {
      ok: false,
      error: "Você está sem créditos. Faça upgrade do plano ou recarregue para captar mais leads.",
    };
  }

  const termo = (input.termoBusca ?? "").trim();
  if (!termo) return { ok: false, error: "Informe o que você quer buscar." };

  // Instagram tem fluxo próprio (2 etapas): descoberta por hashtag/local →
  // qualificação dos perfis. Bem diferente do Google Maps.
  if (input.origem === "instagram") {
    return criarJobInstagram(org.orgId, input, saldo);
  }

  const origem = "google_maps" as const;
  const qtd = Math.min(120, saldo, Math.max(1, Math.trunc(input.quantidade) || 20));

  const supabase = await createClient();

  // Nome da lista: usuário escolhe; se vazio, gera automático.
  const localizacao = (input.localizacao ?? "").trim();
  const auto = `${termo}${localizacao ? ` · ${localizacao}` : ""}`;
  const nomeLista = (input.nomeLista ?? "").trim() || auto;

  // Segmento (CNAE) p/ achar o dono (só Google Maps). A cidade/UF é extraída
  // dos endereços dos leads no enriquecimento — mais confiável.
  const cnae = (input.cnae ?? "").trim() || null;
  const donoProcessado = !cnae; // sem segmento, não busca o dono

  const { data: lista, error: e1 } = await supabase
    .from("listas")
    .insert({
      organizacao_id: org.orgId,
      nome: nomeLista,
      origem,
      cnae,
      dono_processado: donoProcessado,
    })
    .select("id")
    .single();
  if (e1) return { ok: false, error: e1.message };

  // Dispara o Apify (assíncrono). O sync importa quando terminar.
  const run = await iniciarRun(ACTOR_GOOGLE_MAPS, {
    searchStringsArray: [termo],
    locationQuery: localizacao || undefined,
    maxCrawledPlacesPerSearch: qtd,
    language: "pt-BR",
    skipClosedPlaces: false,
  });

  if (!run) {
    await supabase.from("listas").delete().eq("id", lista.id);
    return {
      ok: false,
      error: "Não consegui iniciar a captação. Tente de novo em instantes.",
    };
  }

  const { error: e2 } = await supabase.from("jobs_apify").insert({
    organizacao_id: org.orgId,
    lista_id: lista.id,
    origem,
    termo_busca: termo,
    localizacao: localizacao || null,
    quantidade: qtd,
    status: "rodando",
    apify_run_id: run.id,
  });
  if (e2) return { ok: false, error: e2.message };

  revalidatePath("/dashboard/capture");
  return { ok: true };
}

// Captação por Instagram (2 etapas). Cria a lista + o job na fase 'descoberta';
// o sincronizarJobs cuida de disparar a etapa 2 e importar os perfis.
async function criarJobInstagram(
  orgId: string,
  input: JobInput,
  saldo: number,
): Promise<ActionResult> {
  const metodo = input.metodo === "local" ? "local" : "hashtag";
  const termo = (input.termoBusca ?? "").trim();
  const localizacao = (input.localizacao ?? "").trim();

  // No método hashtag o termo são as hashtags (separadas por vírgula/espaço).
  const termos =
    metodo === "hashtag"
      ? termo.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean)
      : [termo];
  if (!termos.length) {
    return {
      ok: false,
      error: metodo === "hashtag" ? "Informe ao menos uma hashtag." : "Informe o nicho do local.",
    };
  }
  if (metodo === "local" && !localizacao) {
    return { ok: false, error: "Informe a localização (cidade) para buscar por local." };
  }

  const qtd = Math.min(100, saldo, Math.max(1, Math.trunc(input.quantidade) || 20));
  // Sobra-busca de posts p/ sobreviver ao filtro rígido (nem todo perfil passa).
  const postsLimite = Math.min(150, qtd * 3);

  const supabase = await createClient();

  const auto =
    metodo === "hashtag"
      ? `Instagram · ${termos.map((t) => `#${t.replace(/^#/, "")}`).join(" ")}`
      : `Instagram · ${termo}${localizacao ? ` · ${localizacao}` : ""}`;
  const nomeLista = (input.nomeLista ?? "").trim() || auto;

  const { data: lista, error: e1 } = await supabase
    .from("listas")
    .insert({
      organizacao_id: orgId,
      nome: nomeLista,
      origem: "instagram",
      dono_processado: true, // Instagram não usa discovery de dono (só Google Maps).
    })
    .select("id")
    .single();
  if (e1) return { ok: false, error: e1.message };

  const run = await iniciarInstagramDescoberta({ metodo, termos, localizacao, limite: postsLimite });
  if (!run) {
    await supabase.from("listas").delete().eq("id", lista.id);
    return { ok: false, error: "Não consegui iniciar a captação. Tente de novo em instantes." };
  }

  const { error: e2 } = await supabase.from("jobs_apify").insert({
    organizacao_id: orgId,
    lista_id: lista.id,
    origem: "instagram",
    termo_busca: termos.join(", "),
    localizacao: localizacao || null,
    quantidade: qtd,
    status: "rodando",
    fase: "descoberta",
    apify_run_id: run.id,
  });
  if (e2) return { ok: false, error: e2.message };

  revalidatePath("/dashboard/capture");
  return { ok: true };
}
