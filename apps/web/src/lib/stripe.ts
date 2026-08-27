import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

export const stripeConfigurado = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("rk_") ||
  (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_");

// Catálogo de preços criados na Stripe (modo LIVE).
export type Ciclo = "mensal" | "anual";

// Preços MENSAIS (recurring interval: month).
export const PRECOS_ASSINATURA: Record<string, string> = {
  starter: "price_1U5AmyFlEn26WuJOmNmsB9qR",
  pro: "price_1U5AmzFlEn26WuJOfYdo4nh5",
  scale: "price_1U5An0FlEn26WuJOqSQVUtVT",
};

// Preços ANUAIS — pagamento ÚNICO (one_time), à vista, já com 35% off.
// O cliente paga 1× (cartão à vista ou Pix) e recebemos o valor cheio na hora.
// Não renova sozinho: dá direito a 12 meses de créditos (renovados mês a mês).
export const PRECOS_ASSINATURA_ANUAL: Record<string, string> = {
  starter: "price_1U9CnwFlEn26WuJO25fturI1",
  pro: "price_1U9CnxFlEn26WuJOHXLfzk3d",
  scale: "price_1U9CnyFlEn26WuJOaTqv5M0p",
};

// Resolve o price ID conforme o ciclo escolhido no toggle Mensal/Anual.
export function precoAssinatura(planoId: string, ciclo: Ciclo = "mensal"): string | undefined {
  return ciclo === "anual" ? PRECOS_ASSINATURA_ANUAL[planoId] : PRECOS_ASSINATURA[planoId];
}

export interface PacoteRecarga {
  id: string;
  creditos: number;
  preco: number; // R$
  priceId: string;
}

export const PACOTES_RECARGA: PacoteRecarga[] = [
  { id: "pack_100", creditos: 100, preco: 49, priceId: "price_1U5An2FlEn26WuJOITrpJOcv" },
  { id: "pack_500", creditos: 500, preco: 199, priceId: "price_1U5An3FlEn26WuJOeR0QYUv8" },
  { id: "pack_1000", creditos: 1000, preco: 349, priceId: "price_1U5An4FlEn26WuJOfo9Wo7Wi" },
];

// Processa uma sessão de checkout paga e credita a org. IDEMPOTENTE:
// registra o session_id em `pagamentos` (unique) — se já processou, ignora.
// Usa service role (funciona tanto no retorno do usuário quanto no webhook).
export async function processarSessaoCheckout(sessionId: string): Promise<boolean> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") return false;

  const meta = session.metadata ?? {};
  const orgId = meta.org_id;
  const tipo = meta.tipo; // 'recarga' | 'assinatura'
  const creditos = Number(meta.creditos ?? 0);
  const plano = meta.plano ?? null;
  const ciclo = meta.ciclo; // 'mensal' | 'anual' (só em assinatura)
  if (!orgId || !tipo) return false;

  const supabase = createAdminClient();

  // Idempotência: tenta registrar o pagamento; se já existe, para.
  const { error: dup } = await supabase.from("pagamentos").insert({
    organizacao_id: orgId,
    stripe_session_id: session.id,
    tipo,
    plano,
    creditos,
    valor: session.amount_total ?? 0,
    status: "pago",
  });
  if (dup) return false; // provavelmente unique violation → já processado

  // Lê saldo atual
  const { data: org } = await supabase
    .from("organizacoes")
    .select("creditos_plano, creditos_extra")
    .eq("id", orgId)
    .maybeSingle();

  if (tipo === "recarga") {
    const novoExtra = (org?.creditos_extra ?? 0) + creditos;
    await supabase.from("organizacoes").update({ creditos_extra: novoExtra }).eq("id", orgId);
    await supabase.from("creditos_transacoes").insert({
      organizacao_id: orgId,
      tipo: "recarga",
      quantidade: creditos,
      saldo_apos: (org?.creditos_plano ?? 0) + novoExtra,
      descricao: `Recarga de ${creditos} créditos (Stripe)`,
    });
  } else if (tipo === "assinatura") {
    const proxima = new Date();
    proxima.setMonth(proxima.getMonth() + 1);

    // Anual = pagamento único → vence em 12 meses e volta pro Free.
    // Mensal = assinatura recorrente → não expira do nosso lado (null).
    let planoExpiraEm: string | null = null;
    if (ciclo === "anual") {
      const venc = new Date();
      venc.setFullYear(venc.getFullYear() + 1);
      planoExpiraEm = venc.toISOString();
    }

    await supabase
      .from("organizacoes")
      .update({
        plano: plano ?? undefined,
        creditos_plano: creditos,
        creditos_renovam_em: proxima.toISOString(),
        plano_expira_em: planoExpiraEm,
        stripe_customer_id: (session.customer as string) ?? null,
      })
      .eq("id", orgId);
    await supabase.from("creditos_transacoes").insert({
      organizacao_id: orgId,
      tipo: "inclusao_plano",
      quantidade: creditos,
      saldo_apos: creditos + (org?.creditos_extra ?? 0),
      descricao: `Assinatura do plano ${plano} (Stripe)`,
    });
  }

  return true;
}
