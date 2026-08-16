# 🚀 MeuLead — Comece Aqui (guia simples)

Gabriel, este é o **checklist do que você precisa me trazer** pra eu terminar de ligar o
sistema. Está em linguagem simples, com "onde clicar". Você só precisa **copiar e colar**
alguns códigos secretos. Nada de programação da sua parte. 🙂

> 📌 **Como me entregar:** vá preenchendo os campos `COLE_AQUI` no arquivo **`.env`**
> (eu já deixei ele pronto na pasta do projeto). É só abrir, colar e salvar.

---

## 1) 🟢 Supabase (o "banco de dados" do sistema)

É onde ficam guardados os clientes, leads, conversas, etc.

**Onde pegar as chaves:**
1. Entre em https://supabase.com e abra o seu projeto.
2. Menu lateral → ⚙️ **Project Settings** → **API**.
3. Copie estes 3 valores:

| No painel aparece como | Cole no `.env` em | O que é |
|---|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | endereço do seu banco |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave "pública" (pode aparecer no site) |
| **service_role** 🔒 | `SUPABASE_SERVICE_ROLE_KEY` | chave "mestra" — **NUNCA compartilhe** |

4. Ainda em **Project Settings** → **Database** → seção **Connection string** →
   aba **URI**. Copie o texto que começa com `postgresql://...` e cole em `SUPABASE_DB_URL`.
   (Ele vai pedir a **senha do banco** — é a senha que você criou quando fez o projeto.
   Se esqueceu, dá pra resetar nessa mesma tela.)

---

## 2) 🕷️ Apify (o "robô" que capta os leads)

É quem vai no Google Maps / Instagram / LinkedIn buscar donos de empresa.

1. Entre em https://apify.com e faça login.
2. Canto superior direito → sua foto → **Settings** → **API & Integrations**.
3. Copie o **Personal API token** e cole em `APIFY_TOKEN`.

> 💡 Você **não precisa** escolher os robôs agora — eu já configuro os certos
> (Google Maps, Instagram, LinkedIn). Só a chave já basta pra começar.

---

## 3) 💬 Evolution API (seu WhatsApp — você já tem!)

É o serviço na sua VPS que segura o WhatsApp conectado.

Me traga 2 coisas (você configurou quando instalou):

| Cole no `.env` em | O que é | Onde acho |
|---|---|---|
| `EVOLUTION_API_URL` | endereço da sua Evolution | ex: `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | a "senha" global da API | no arquivo de config da Evolution (`AUTHENTICATION_API_KEY`) |

> ❓ Se não lembrar a chave: ela está na configuração (`.env` ou docker) da sua Evolution
> na VPS, no campo **AUTHENTICATION_API_KEY** (às vezes chamado `apikey`).

---

## 4) 🔁 n8n (o "automatizador" — você já tem!)

É quem vai disparar mensagens e fazer o follow-up sozinho.

| Cole no `.env` em | O que é | Onde acho |
|---|---|---|
| `N8N_WEBHOOK_URL` | endereço do seu n8n | ex: `https://n8n.seudominio.com` |
| `N8N_WEBHOOK_SECRET` | uma senha que **você inventa** agora | pode ser qualquer texto forte, ex: `mL_2026_x9f!` |

> 💡 O `N8N_WEBHOOK_SECRET` é você quem escolhe — serve pra ninguém de fora chamar
> seus fluxos. Guarde ele; vamos usar o mesmo dos dois lados.

---

## 5) 🌐 Domínio (opcional agora)

Pra quando formos publicar. Se já tiver um domínio (ex: `meulead.com.br`), ótimo.
Se não tiver, **pode deixar pra depois** — o sistema roda no seu computador
(`localhost`) enquanto desenvolvemos.

---

## ✅ Resumo do que preciso de você

- [ ] 3 chaves do **Supabase** + a connection string
- [ ] 1 token do **Apify**
- [ ] URL + chave da sua **Evolution API**
- [ ] URL do seu **n8n** + uma senha que você inventa
- [ ] (opcional) domínio

**Enquanto você junta isso, eu já vou montando o sistema** e te entrego um endereço
`http://localhost:3000` pra você ver a tela de login funcionando. 🚀

> Dúvida em qualquer passo? Só me chamar aqui que eu te explico o item específico.
