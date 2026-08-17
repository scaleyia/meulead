"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { saldoDaOrg } from "@/lib/creditos";
import {
  iniciarRun,
  apifyDisponivel,
  ACTOR_GOOGLE_MAPS,
  ACTOR_INSTAGRAM,
} from "@/lib/apify";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface JobInput {
  origem: "google_maps" | "instagram";
  quantidade: number;
  nomeLista?: string; // nome escolhido pelo usuário (opcional)
  termoBusca: string; // termo/nicho
  localizacao?: string; // só google_maps
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

  const origem = input.origem === "instagram" ? "instagram" : "google_maps";
  const limite = origem === "instagram" ? 100 : 120;
  const qtd = Math.min(limite, saldo, Math.max(1, Math.trunc(input.quantidade) || 20));

  const supabase = await createClient();

  // Nome da lista: usuário escolhe; se vazio, gera automático.
  const localizacao = (input.localizacao ?? "").trim();
  const auto =
    origem === "instagram"
      ? `Instagram · ${termo}${localizacao ? ` · ${localizacao}` : ""}`
      : `${termo}${localizacao ? ` · ${localizacao}` : ""}`;
  const nomeLista = (input.nomeLista ?? "").trim() || auto;

  const { data: lista, error: e1 } = await supabase
    .from("listas")
    .insert({ organizacao_id: org.orgId, nome: nomeLista, origem })
    .select("id")
    .single();
  if (e1) return { ok: false, error: e1.message };

  // Dispara o Apify (assíncrono). O sync importa quando terminar.
  const run =
    origem === "instagram"
      ? await iniciarRun(ACTOR_INSTAGRAM, {
          // A API não filtra por país; injetar a localização na busca direciona
          // os resultados pro Brasil/cidade informada.
          search: `${termo}${localizacao ? ` ${localizacao}` : " brasil"}`,
          searchType: "user",
          searchLimit: qtd,
          resultsType: "details",
          resultsLimit: qtd,
          addParentData: false,
        })
      : await iniciarRun(ACTOR_GOOGLE_MAPS, {
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
