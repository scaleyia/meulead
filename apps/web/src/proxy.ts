import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/env";

// No Next 16 o "middleware" foi renomeado para "proxy" (runtime nodejs).
// Aqui mantemos a sessão do Supabase atualizada e protegemos as rotas privadas.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Sem chaves reais ainda: não tenta autenticar, só deixa passar.
  if (!supabaseConfigured) return response;

  // Este proxy roda em TODAS as rotas. Se qualquer coisa aqui estourar (ex.:
  // cookie de sessão corrompido faz o @supabase/ssr lançar no parse, ou o
  // Supabase fica momentaneamente indisponível), um throw vira 500 em toda
  // página e o usuário ganha a tela preta "This page couldn't load" da Vercel
  // — e o reload não resolve porque o cookie ruim continua no navegador.
  // Por isso todo o miolo fica dentro de um try/catch com "fail-open".
  try {
    return await autenticar(request, response);
  } catch (erro) {
    console.error("[proxy] falha ao validar sessão:", erro);
    // Cookie/sessão provavelmente corrompido: limpa os cookies do Supabase pra
    // que o próximo request (o reload) comece limpo, e não deixa o site inteiro
    // travado. Em rota privada mandamos pro login; nas públicas, deixa passar.
    const limpo = limparSessao(request);
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redir = NextResponse.redirect(url);
      for (const c of limpo.cookies.getAll()) redir.cookies.set(c.name, c.value, c);
      return redir;
    }
    return limpo;
  }
}

// Remove os cookies de sessão do Supabase (sb-*) da resposta. Usado quando um
// cookie corrompido faz a autenticação estourar.
function limparSessao(request: NextRequest) {
  const response = NextResponse.next({ request });
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-")) response.cookies.delete(c.name);
  }
  return response;
}

async function autenticar(request: NextRequest, initial: NextResponse) {
  let response = initial;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtected = pathname.startsWith("/dashboard");

  // Redirect que PRESERVA os cookies de sessão atualizados (senão o refresh
  // token rotacionado se perde e a sessão "some" no servidor → tela de erro).
  const redirecionar = (destino: string) => {
    const url = request.nextUrl.clone();
    url.pathname = destino;
    const redir = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) {
      redir.cookies.set(c.name, c.value, c);
    }
    return redir;
  };

  // Não logado tentando entrar em área privada → manda pro login.
  if (!user && isProtected) return redirecionar("/login");

  // Já logado abrindo login/signup → manda pro dashboard.
  if (user && isAuthRoute) return redirecionar("/dashboard");

  return response;
}

export const config = {
  matcher: [
    // Roda em tudo, menos assets estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
