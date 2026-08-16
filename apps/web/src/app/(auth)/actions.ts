"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

type ActionState = { error: string } | undefined;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!supabaseConfigured) {
    return { error: "Supabase ainda não configurado. Preencha o .env (veja COMECE-AQUI.md)." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traduzErro(error.message) };
  redirect("/dashboard?entrada=1");
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!supabaseConfigured) {
    return { error: "Supabase ainda não configurado. Preencha o .env (veja COMECE-AQUI.md)." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("org_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { org_name: orgName } }, // lido pelo trigger que cria a org
  });

  if (error) return { error: traduzErro(error.message) };
  redirect("/dashboard?entrada=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "A senha precisa ter ao menos 6 caracteres.";
  return msg;
}
