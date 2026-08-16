"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import {
  conectarInstancia,
  estadoInstancia,
  desconectarInstancia,
  excluirInstancia,
  evolutionConfigurada,
  type EstadoWhats,
} from "@/lib/evolution";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ConectarResult =
  | { ok: true; qr: string | null; pairingCode: string | null }
  | { ok: false; error: string };

export async function criarSessao(nome: string, instancia: string): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!nome.trim()) return { ok: false, error: "Dê um nome à sessão." };
  if (!instancia.trim()) return { ok: false, error: "Informe o nome da instância." };

  // Isola por organização: o nome da instância na Evolution precisa ser único
  // globalmente (multi-tenant). Prefixamos com um trecho do org id.
  const slug = instancia
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const instanciaUnica = `${org.orgId.slice(0, 8)}-${slug || "wpp"}`;

  const supabase = await createClient();
  const { error } = await supabase.from("sessoes_whatsapp").insert({
    organizacao_id: org.orgId,
    nome: nome.trim(),
    instancia: instanciaUnica,
    status: "desconectado",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/whatsapp");
  return { ok: true };
}

async function instanciaDaSessao(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessoes_whatsapp")
    .select("instancia")
    .eq("id", id)
    .maybeSingle();
  return data?.instancia ?? null;
}

// Conecta de verdade na Evolution e devolve o QR (base64) para exibir.
export async function conectarSessao(id: string): Promise<ConectarResult> {
  if (!evolutionConfigurada) return { ok: false, error: "Evolution API não configurada no .env." };
  const instancia = await instanciaDaSessao(id);
  if (!instancia) return { ok: false, error: "Sessão não encontrada." };

  const res = await conectarInstancia(instancia);
  if (!res.ok) return res;

  const supabase = await createClient();
  await supabase.from("sessoes_whatsapp").update({ status: "conectando" }).eq("id", id);
  revalidatePath("/dashboard/whatsapp");
  return { ok: true, qr: res.qr, pairingCode: res.pairingCode };
}

// Verifica o estado atual (chamado em polling enquanto o QR está na tela).
export async function checarConexao(id: string): Promise<{ estado: EstadoWhats; numero: string | null }> {
  if (!evolutionConfigurada) return { estado: "desconectado", numero: null };
  const instancia = await instanciaDaSessao(id);
  if (!instancia) return { estado: "desconectado", numero: null };

  const { estado, numero } = await estadoInstancia(instancia);
  const supabase = await createClient();
  await supabase
    .from("sessoes_whatsapp")
    .update({ status: estado, ...(numero ? { numero } : {}) })
    .eq("id", id);
  revalidatePath("/dashboard/whatsapp");
  return { estado, numero };
}

export async function desconectarSessao(id: string): Promise<ActionResult> {
  const instancia = await instanciaDaSessao(id);
  if (instancia && evolutionConfigurada) await desconectarInstancia(instancia);

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessoes_whatsapp")
    .update({ status: "desconectado", numero: null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/whatsapp");
  return { ok: true };
}

export async function salvarAquecimento(
  sessaoId: string,
  ativo: boolean,
  tecnicas: string[],
  metaDiaria: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const meta = Number.isFinite(metaDiaria) && metaDiaria > 0 ? Math.floor(metaDiaria) : 100;

  const { error } = await supabase
    .from("sessoes_whatsapp")
    .update({
      aquecimento_ativo: ativo,
      aquecimento_config: { tecnicas, meta_diaria: meta },
    })
    .eq("id", sessaoId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/whatsapp");
  return { ok: true };
}

export async function excluirSessao(id: string): Promise<ActionResult> {
  const instancia = await instanciaDaSessao(id);
  if (instancia && evolutionConfigurada) await excluirInstancia(instancia);

  const supabase = await createClient();
  const { error } = await supabase.from("sessoes_whatsapp").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/whatsapp");
  return { ok: true };
}
