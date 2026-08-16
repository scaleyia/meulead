# 🚀 Deploy em produção (Vercel)

Guia passo a passo. O app (Next.js) vai pra **Vercel**; **Supabase, n8n e Evolution continuam onde estão** (não mudam).

---

## 1) Subir o código pro GitHub
1. Crie um repositório **privado** no GitHub (ex: `meulead`).
2. No terminal, dentro da pasta do projeto:
   ```bash
   git remote add origin git@github.com:SEU_USUARIO/meulead.git
   git push -u origin main
   ```
   > O `.env` NÃO vai pro GitHub (está no `.gitignore`) — seus segredos ficam seguros.

## 2) Importar na Vercel
1. Em https://vercel.com → **Add New → Project** → importe o repo `meulead`.
2. Em **Root Directory**, selecione **`apps/web`**.
3. Framework: **Next.js** (detecta sozinho). Build/Install: deixe o padrão (pnpm).
4. **Não faça deploy ainda** — primeiro adicione as variáveis (passo 3).

## 3) Variáveis de ambiente (Vercel → Settings → Environment Variables)
Cole exatamente estas (as marcadas 🔒 são secretas):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (mesmo do .env) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (mesmo do .env) |
| `SUPABASE_SERVICE_ROLE_KEY` 🔒 | (mesmo do .env) |
| `APIFY_TOKEN` 🔒 | (mesmo do .env) |
| `EVOLUTION_API_URL` | (mesmo do .env) |
| `EVOLUTION_API_KEY` 🔒 | (mesmo do .env) |
| `N8N_WEBHOOK_URL` | (mesmo do .env) |
| `N8N_WEBHOOK_SECRET` 🔒 | (mesmo do .env) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (test por enquanto) |
| `STRIPE_SECRET_KEY` 🔒 | (test por enquanto) |
| `STRIPE_WEBHOOK_SECRET` 🔒 | **preencho eu no passo 5** |
| `ADMIN_EMAILS` | contato@scaley.com.br |
| `APP_URL` | **a URL da Vercel** (ex: `https://meulead.vercel.app`) |

Depois clique em **Deploy**.

## 4) Ajustar o Supabase pro domínio novo
Supabase → **Authentication → URL Configuration**:
- **Site URL:** a URL da Vercel
- **Redirect URLs:** adicione `https://SUA-URL.vercel.app/**`

## 5) Webhook do Stripe (me avise a URL da Vercel)
Quando o deploy terminar e você tiver a URL, me manda que eu:
- Crio o **webhook endpoint** na Stripe apontando pra `https://SUA-URL/api/stripe/webhook`
- Pego o **signing secret** e você cola em `STRIPE_WEBHOOK_SECRET` na Vercel

## 6) Virar a chave test → LIVE (quando for cobrar de verdade)
1. **Ative sua conta** na Stripe (CNPJ + conta bancária) — só você faz isso.
2. Me avise que eu recrio os produtos/preços no **modo live** e te passo as chaves `pk_live`/`sk_live` pra trocar na Vercel + refaço o webhook em live.

## 7) Apify — plano pago (antes de escalar)
O plano **Free** trava em ~US$5/mês (~500 leads no total). Antes de rodar tráfego forte, faça upgrade do Apify pra pay-as-you-go.

---

## ✅ O que continua igual (não mexe)
- **Supabase** (banco/auth) — nuvem
- **n8n** (captação + motor de disparo) — sua VPS
- **Evolution API** (WhatsApp) — sua VPS

Só o **app** muda de `localhost` → Vercel. Os webhooks e chamadas continuam apontando pros serviços da VPS normalmente.
