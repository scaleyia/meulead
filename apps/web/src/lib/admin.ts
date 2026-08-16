// Quem é "admin da plataforma" (dono do MeuLead) — vê o painel de Interessados.
// Configurável via ADMIN_EMAILS no .env (separado por vírgula).

const ADMINS = (process.env.ADMIN_EMAILS ?? "contato@scaley.com.br")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMINS.includes(email.toLowerCase());
}
