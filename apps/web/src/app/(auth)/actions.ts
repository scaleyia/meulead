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
  redirect("/dashboard");
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!supabaseConfigured) {
    return { error: "Supabase ainda não configurado. Preencha o .env (veja COMECE-AQUI.md)." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("org_name") ?? "");
  const whatsapp = normalizaWhatsapp(String(formData.get("whatsapp") ?? ""));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // org_name é lido pelo trigger que cria a org; whatsapp fica no perfil do usuário.
    options: { data: { org_name: orgName, whatsapp } },
  });

  if (error) return { error: traduzErro(error.message) };
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/lp");
}

// Mantém só dígitos e prefixa +55 quando o número vier sem código de país.
function normalizaWhatsapp(raw: string): string {
  const digitos = raw.replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("55")) return `+${digitos}`;
  if (digitos.length <= 11) return `+55${digitos}`;
  return `+${digitos}`;
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "A senha precisa ter ao menos 6 caracteres.";
  return msg;
}
