import { stripe, processarSessaoCheckout } from "@/lib/stripe";

// Webhook do Stripe (produção). Em dev, o crédito também é liberado no retorno
// do checkout (ver página de créditos), então funciona sem webhook local.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!secret || secret === "COLE_AQUI") {
    return new Response("webhook não configurado", { status: 200 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return new Response(`assinatura inválida: ${(e as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    try {
      await processarSessaoCheckout(session.id);
    } catch (e) {
      return new Response(`erro ao processar: ${(e as Error).message}`, { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
