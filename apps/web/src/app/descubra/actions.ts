"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function salvarInteressado(input: {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  segmento: string;
  uf: string;
  estimativa: number;
  hp?: string; // honeypot anti-bot (deve vir vazio)
}): Promise<ActionResult> {
  // Anti-spam: se o campo oculto foi preenchido, é bot — finge sucesso e ignora.
  if (input.hp && input.hp.trim() !== "") return { ok: true };

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false, error: "Informe um e-mail válido." };
  if (!input.telefone.trim()) return { ok: false, error: "Informe seu telefone." };
  if (input.telefone.replace(/\D/g, "").length < 8)
    return { ok: false, error: "Telefone inválido." };

  // Página pública → cliente anônimo. A policy de RLS permite INSERT anônimo.
  const supabase = await createClient();
  const { error } = await supabase.from("interessados").insert({
    nome: input.nome.trim() || null,
    email,
    telefone: input.telefone.trim(),
    empresa: input.empresa.trim() || null,
    segmento: input.segmento || null,
    uf: input.uf || null,
    estimativa: input.estimativa || null,
    origem: "landing",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
