// Quem é "admin da plataforma" (dono do MeuLead).
// Estes e-mails são SEMPRE admin (independente da env). Dá pra adicionar mais
// via ADMIN_EMAILS no .env/Vercel (separado por vírgula) — os dois se somam.
const ADMINS_FIXOS = ["contato@scaley.com.br", "scaleyia@gmail.com"];

const ADMINS = new Set(
  [...ADMINS_FIXOS, ...(process.env.ADMIN_EMAILS ?? "").split(",")]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMINS.has(email.toLowerCase());
}
