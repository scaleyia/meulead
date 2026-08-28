"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { saldoDaOrg } from "@/lib/creditos";
import { iniciarRun, apifyDisponivel, ACTOR_GOOGLE_MAPS } from "@/lib/apify";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface JobInput {
  origem: "google_maps" | "instagram";
  quantidade: number;
  nomeLista?: string; // nome escolhido pelo usuário (opcional)
  termoBusca: string; // termo/nicho
  localizacao?: string; // só google_maps
  cnae?: string; // segmento p/ achar o dono (só google_maps)
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

  // Instagram desativado por enquanto — captação só via Google Maps.
  if (input.origem === "instagram") {
    return { ok: false, error: "A captação por Instagram está temporariamente desativada." };
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
