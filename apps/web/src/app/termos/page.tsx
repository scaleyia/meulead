import Link from "next/link";

export const metadata = { title: "Termos de Uso" };

const ATUALIZADO = "16 de agosto de 2026";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/descubra" className="text-lg font-bold text-neutral-900">
          Meu<span className="text-blue-600">Lead</span>
        </Link>
        <Link href="/privacidade" className="text-sm text-neutral-500 hover:text-neutral-900">
          Política de Privacidade
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-20 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-neutral-900">Termos de Uso</h1>
        <p className="mt-1 text-neutral-500">Última atualização: {ATUALIZADO}</p>

        <Sec titulo="1. Objeto">
          O MeuLead é uma plataforma de captação de leads, gestão (CRM) e disparo de mensagens no
          WhatsApp. Ao criar uma conta, você concorda com estes Termos.
        </Sec>

        <Sec titulo="2. Uso responsável e conformidade (importante)">
          Você é o único responsável pelo conteúdo das mensagens que dispara e pelo uso que faz dos
          contatos. Você se compromete a: (a) cumprir a <strong>LGPD</strong> e a legislação
          aplicável; (b) enviar apenas comunicações lícitas e de interesse legítimo; (c){" "}
          <strong>respeitar pedidos de descadastro</strong> (opt-out); (d) não enviar spam, conteúdo
          ilegal, enganoso ou abusivo. O MeuLead fornece a ferramenta; a responsabilidade pelo uso é
          sua.
        </Sec>

        <Sec titulo="3. Créditos e pagamentos">
          Alguns recursos consomem <strong>créditos</strong> (1 crédito = 1 lead captado). Créditos
          do plano renovam mensalmente e não acumulam; créditos avulsos (recarga) não expiram.
          Pagamentos são processados pela Stripe. Recargas são pagamentos únicos; assinaturas são
          cobradas mensalmente até o cancelamento.
        </Sec>

        <Sec titulo="4. Cancelamento">
          Você pode cancelar a assinatura a qualquer momento; o acesso permanece até o fim do período
          já pago. Créditos avulsos já adquiridos permanecem disponíveis.
        </Sec>

        <Sec titulo="5. Disponibilidade">
          Empenhamo-nos para manter o serviço disponível, mas ele é fornecido &quot;no estado em que
          se encontra&quot;. Integrações de terceiros (WhatsApp/Evolution, Apify, Stripe) podem sofrer
          instabilidades fora do nosso controle.
        </Sec>

        <Sec titulo="6. Limitação de responsabilidade">
          Na máxima extensão permitida em lei, o MeuLead não se responsabiliza por bloqueios de
          números de WhatsApp, danos indiretos, lucros cessantes ou pelo uso indevido da ferramenta
          pelo usuário.
        </Sec>

        <Sec titulo="7. Alterações">
          Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas. O uso continuado
          após alterações implica concordância.
        </Sec>

        <p className="mt-10 text-neutral-600">
          Dúvidas:{" "}
          <a className="text-blue-600" href="mailto:contato@scaley.com.br">
            contato@scaley.com.br
          </a>
          . Veja também nossa{" "}
          <Link className="text-blue-600" href="/privacidade">
            Política de Privacidade
          </Link>
          .
        </p>

        <p className="mt-8 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-500">
          Modelo inicial, sem valor de aconselhamento jurídico. Revise com um advogado.
        </p>
      </article>
    </main>
  );
}

function Sec({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
      <div className="mt-2 text-neutral-700">{children}</div>
    </section>
  );
}
