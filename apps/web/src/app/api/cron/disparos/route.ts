import { createAdminClient } from "@/lib/supabase/admin";
import { prepararDisparo } from "@/lib/disparo";

// Dispara as campanhas agendadas cujo horário já chegou.
// Chamado pelo Vercel Cron. Protegido por CRON_SECRET (se configurado).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const agora = new Date().toISOString();

  const { data: devidas } = await supabase
    .from("campanhas")
    .select("id, organizacao_id")
    .eq("status", "agendada")
    .lte("agendada_para", agora);

  let disparadas = 0;
  for (const c of devidas ?? []) {
    const r = await prepararDisparo(supabase, c.id, c.organizacao_id);
    if (r.ok) disparadas++;
  }

  return Response.json({ ok: true, verificadas: devidas?.length ?? 0, disparadas });
}
