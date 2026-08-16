import { createClient } from "@supabase/supabase-js";
import type { Database } from "@meulead/db";
import { SUPABASE_URL } from "@/lib/env";

// Cliente com service_role — ignora RLS. Usar SOMENTE no servidor
// (webhook do Stripe, processamento de pagamento). Nunca no cliente.
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
