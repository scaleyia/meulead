"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { saldoDaOrg } from "@/lib/creditos";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface JobInput {
  origem: string;
  quantidade: number;
  // modo google_maps
  termoBusca?: string;
  localizacao?: string;
  // modo cnpj (donos)
  cnae?: string;
  segmentoLabel?: string;
  uf?: string;
}

export async function criarJob(input: JobInput): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  // Bloqueio por créditos (1 crédito = 1 lead). Sem saldo, não capta.
  const saldo = await saldoDaOrg(org.orgId);
  if (saldo <= 0) {
    return {
      ok: false,
      error: "Você está sem créditos. Faça upgrade do plano ou recarregue para captar mais leads.",
    };
  }

  const supabase = await createClient();
  const base = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  // ---------------- Modo Donos (CNPJ por segmento) ----------------
  if (input.origem === "cnpj") {
    const cnae = (input.cnae ?? "").trim();
    if (!cnae) return { ok: false, error: "Escolha um segmento." };
    const uf = (input.uf ?? "").trim();
    // Nunca pede mais leads do que o saldo cobre.
    const qtd = Math.min(500, saldo, Math.max(1, Math.trunc(input.quantidade) || 20));
    const seg = input.segmentoLabel ?? "Segmento";

    const nomeLista = `${seg}${uf ? ` · ${uf}` : ""}`;
    const { data: lista, error: e1 } = await supabase
      .from("listas")
      .insert({ organizacao_id: org.orgId, nome: nomeLista, origem: "cnpj" })
      .select("id")
      .single();
    if (e1) return { ok: false, error: e1.message };

    const { data: job, error: e2 } = await supabase
      .from("jobs_apify")
      .insert({
        organizacao_id: org.orgId,
        lista_id: lista.id,
        origem: "cnpj",
        termo_busca: `${seg} (CNAE ${cnae})`,
        localizacao: uf || null,
        quantidade: qtd,
        status: "pendente",
      })
      .select("id")
      .single();
    if (e2) return { ok: false, error: e2.message };

    if (base && secret) {
      try {
        await fetch(`${base}/webhook/cap-cnpj-${secret}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            job_id: job.id,
            organizacao_id: org.orgId,
            lista_id: lista.id,
            cnaes: [cnae],
            uf,
            porte: ["01", "03"], // ME + EPP: onde o sócio é o dono que opera
            maxResults: qtd,
          }),
        });
        await supabase.from("jobs_apify").update({ status: "rodando" }).eq("id", job.id);
      } catch {
        // n8n indisponível: job fica "pendente".
      }
    }

    revalidatePath("/dashboard/capture");
    return { ok: true };
  }

  // ---------------- Modo Google Maps ----------------
  const termoBusca = (input.termoBusca ?? "").trim();
  const localizacao = (input.localizacao ?? "").trim();
  if (!termoBusca) return { ok: false, error: "Informe o termo de busca." };
  // Nunca pede mais leads do que o saldo cobre.
  const qtd = Math.min(100, saldo, Math.max(1, Math.trunc(input.quantidade) || 20));

  const nomeLista = `${termoBusca}${localizacao ? ` · ${localizacao}` : ""}`;
  const { data: lista, error: e1 } = await supabase
    .from("listas")
    .insert({ organizacao_id: org.orgId, nome: nomeLista, origem: "google_maps" })
    .select("id")
    .single();
  if (e1) return { ok: false, error: e1.message };

  const { data: job, error: e2 } = await supabase
    .from("jobs_apify")
    .insert({
      organizacao_id: org.orgId,
      lista_id: lista.id,
      origem: "google_maps",
      termo_busca: termoBusca,
      localizacao: localizacao || null,
      quantidade: qtd,
      status: "pendente",
    })
    .select("id")
    .single();
  if (e2) return { ok: false, error: e2.message };

  if (base && secret) {
    try {
      await fetch(`${base}/webhook/cap-${secret}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          organizacao_id: org.orgId,
          lista_id: lista.id,
          origem: "google_maps",
          termo_busca: termoBusca,
          localizacao,
          quantidade: qtd,
        }),
      });
      await supabase.from("jobs_apify").update({ status: "rodando" }).eq("id", job.id);
    } catch {
      // n8n indisponível: job fica "pendente".
    }
  }

  revalidatePath("/dashboard/capture");
  return { ok: true };
}
