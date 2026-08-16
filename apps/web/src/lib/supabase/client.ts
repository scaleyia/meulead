"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@meulead/db";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

// Cliente Supabase para uso no navegador (Client Components).
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
