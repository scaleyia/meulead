"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createList(name: string, source: string | null): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!name.trim()) return { ok: false, error: "Dê um nome à lista." };

  const supabase = await createClient();
  const { error } = await supabase.from("listas").insert({
    organizacao_id: org.orgId,
    nome: name.trim(),
    origem: source || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/lists");
  return { ok: true };
}

export async function deleteList(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("listas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/lists");
  return { ok: true };
}
