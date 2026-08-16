"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";

export type ActionResult = { ok: true; inserted?: number } | { ok: false; error: string };

export interface LeadInput {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
}

export async function addLead(listId: string, input: LeadInput): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    organizacao_id: org.orgId,
    lista_id: listId,
    nome: input.name?.trim() || null,
    empresa: input.company?.trim() || null,
    telefone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    origem: "manual",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/lists/${listId}`);
  return { ok: true, inserted: 1 };
}

export async function importLeads(listId: string, rows: LeadInput[]): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const clean = rows
    .map((r) => ({
      organizacao_id: org.orgId,
      lista_id: listId,
      nome: r.name?.trim() || null,
      empresa: r.company?.trim() || null,
      telefone: r.phone?.trim() || null,
      email: r.email?.trim() || null,
      origem: "import" as const,
    }))
    .filter((r) => r.nome || r.empresa || r.telefone || r.email);

  if (clean.length === 0) return { ok: false, error: "Nenhuma linha válida no arquivo." };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("leads")
    .insert(clean, { count: "exact" });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/lists/${listId}`);
  return { ok: true, inserted: count ?? clean.length };
}

export async function deleteLead(id: string, listId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/lists/${listId}`);
  return { ok: true };
}
