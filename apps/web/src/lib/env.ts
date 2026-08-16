// Acesso centralizado às variáveis de ambiente do lado servidor/cliente.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Enquanto o Gabriel não colar as chaves reais no .env, o app sobe mesmo assim
// (mostra o login), mas evita chamar o Supabase com credenciais placeholder.
export const supabaseConfigured =
  SUPABASE_URL.startsWith("http") && !SUPABASE_URL.includes("COLE_AQUI") && SUPABASE_ANON_KEY.length > 10;
