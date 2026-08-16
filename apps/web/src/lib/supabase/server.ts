import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@meulead/db";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

// Cliente Supabase para Server Components / Server Actions / Route Handlers.
// No Next 16 o `cookies()` é assíncrono.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado de um Server Component (sem resposta pra escrever cookie).
          // O refresh de sessão acontece no proxy.ts, então pode ignorar aqui.
        }
      },
    },
  });
}
