"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/org";
import { isAdmin } from "@/lib/admin";
import { adicionarCreditosExtra } from "@/lib/creditos";
import { planoPorId } from "@/lib/planos";
import { stripe, stripeConfigurado, PRECOS_ASSINATURA, PACOTES_RECARGA } from "@/lib/stripe";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Compra de pacote de créditos (pagamento único).
export async function iniciarCheckoutRecarga(packId: string): Promise<CheckoutResult> {
  if (!stripeConfigurado) return { ok: false, error: "Pagamento não configurado." };
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const pack = PACOTES_RECARGA.find((p) => p.id === packId);
  if (!pack) return { ok: false, error: "Pacote inválido." };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: pack.priceId, quantity: 1 }],
    customer_email: org.email,
    success_url: `${APP_URL}/dashboard/creditos?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/dashboard/creditos?cancel=1`,
    metadata: { org_id: org.orgId, tipo: "recarga", creditos: String(pack.creditos) },
  });

  return session.url ? { ok: true, url: session.url } : { ok: false, error: "Falha ao criar checkout." };
}

// Assinatura de um plano (recorrente mensal).
export async function iniciarCheckoutAssinatura(planoId: string): Promise<CheckoutResult> {
  if (!stripeConfigurado) return { ok: false, error: "Pagamento não configurado." };
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };

  const priceId = PRECOS_ASSINATURA[planoId];
  const plano = planoPorId(planoId);
  if (!priceId) return { ok: false, error: "Plano inválido." };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: org.email,
    success_url: `${APP_URL}/dashboard/creditos?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/dashboard/creditos?cancel=1`,
    metadata: {
      org_id: org.orgId,
      tipo: "assinatura",
      plano: planoId,
      creditos: String(plano.creditosMes),
    },
  });

  return session.url ? { ok: true, url: session.url } : { ok: false, error: "Falha ao criar checkout." };
}

// Recarga manual (admin) — mantida para ajustes internos.

// Recarga manual (admin) — enquanto o Stripe não entra, você libera créditos na mão.
export async function recarregarManual(quantidade: number): Promise<ActionResult> {
  const org = await getActiveOrg();
  if (!org) return { ok: false, error: "Sessão expirada." };
  if (!isAdmin(org.email)) return { ok: false, error: "Apenas o admin pode recarregar manualmente." };

  const qtd = Math.trunc(quantidade);
  if (!Number.isFinite(qtd) || qtd <= 0) return { ok: false, error: "Quantidade inválida." };

  await adicionarCreditosExtra(org.orgId, qtd, "Recarga manual (admin)");
  revalidatePath("/dashboard/creditos");
  return { ok: true };
}
