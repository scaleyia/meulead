import Link from "next/link";

export const metadata = { title: "Política de Privacidade" };

const ATUALIZADO = "16 de agosto de 2026";

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/descubra" className="text-lg font-bold text-neutral-900">
          Meu<span className="text-emerald-600">Lead</span>
        </Link>
        <Link href="/termos" className="text-sm text-neutral-500 hover:text-neutral-900">
          Termos de Uso
        </Link>
      </header>

      <article className="prose-neutral mx-auto max-w-3xl px-6 pb-20 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-neutral-900">Política de Privacidade</h1>
        <p className="mt-1 text-neutral-500">Última atualização: {ATUALIZADO}</p>

        <p className="mt-6">
          Esta Política explica como o <strong>MeuLead</strong> (operado por ScaleyAi) trata dados
          pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <Sec titulo="1. Controlador e Encarregado (DPO)">
          Controlador: ScaleyAi / MeuLead. Contato do Encarregado de Dados (DPO):{" "}
          <a className="text-emerald-600" href="mailto:contato@scaley.com.br">
            contato@scaley.com.br
          </a>
          . Use este canal para exercer seus direitos ou tirar dúvidas sobre privacidade.
        </Sec>

        <Sec titulo="2. Dados que tratamos">
          <ul className="list-disc pl-5">
            <li>
              <strong>Clientes/usuários da plataforma:</strong> nome, e-mail, telefone, dados de
              login e de pagamento (processados pela Stripe).
            </li>
            <li>
              <strong>Leads captados:</strong> dados de empresas e de seus responsáveis (nome do
              sócio, telefone e e-mail comerciais) obtidos de <strong>fontes públicas</strong> e da
              base pública da Receita Federal (CNPJ), no contexto de prospecção B2B.
            </li>
            <li>
              <strong>Interessados (marketing):</strong> nome, e-mail e telefone informados
              voluntariamente em nossa landing page.
            </li>
          </ul>
        </Sec>

        <Sec titulo="3. Finalidades e base legal">
          <ul className="list-disc pl-5">
            <li>
              Prestar o serviço aos clientes — base legal: <strong>execução de contrato</strong>.
            </li>
            <li>
              Prospecção comercial B2B (leads captados) — base legal:{" "}
              <strong>legítimo interesse</strong> (art. 7º, IX, LGPD), limitado a dados de contato
              profissional e sempre com opção de descadastro.
            </li>
            <li>
              Contato com interessados que se cadastraram — base legal:{" "}
              <strong>consentimento</strong>.
            </li>
          </ul>
        </Sec>

        <Sec titulo="4. Compartilhamento e operadores">
          Utilizamos prestadores que atuam como operadores: <strong>Supabase</strong> (banco de
          dados/autenticação), <strong>Stripe</strong> (pagamentos), <strong>Apify</strong>{" "}
          (coleta de dados públicos) e <strong>Evolution API</strong> (envio de mensagens). Alguns
          podem processar dados fora do Brasil (transferência internacional), sempre com salvaguardas
          adequadas. Não vendemos dados pessoais.
        </Sec>

        <Sec titulo="5. Seus direitos (titular)">
          Você pode, a qualquer tempo: confirmar a existência de tratamento; acessar, corrigir,
          anonimizar ou <strong>excluir</strong> seus dados; solicitar portabilidade; e{" "}
          <strong>se opor</strong> ao tratamento ou revogar consentimento. Basta escrever para{" "}
          <a className="text-emerald-600" href="mailto:contato@scaley.com.br">
            contato@scaley.com.br
          </a>
          . Responderemos nos prazos da LGPD.
        </Sec>

        <Sec titulo="6. Descadastro (opt-out)">
          Contatos que não desejam mais receber mensagens podem pedir a remoção a qualquer momento —
          respondendo à mensagem com <strong>&quot;SAIR&quot;</strong> ou escrevendo para o e-mail
          acima. O contato é removido das próximas campanhas.
        </Sec>

        <Sec titulo="7. Segurança">
          Adotamos medidas técnicas e organizacionais: isolamento por organização no banco (Row
          Level Security), criptografia em trânsito e em repouso, controle de acesso e segregação de
          chaves. Nenhum sistema é 100% imune, mas trabalhamos para reduzir riscos continuamente.
        </Sec>

        <Sec titulo="8. Retenção">
          Mantemos os dados apenas pelo tempo necessário às finalidades acima ou por obrigação legal.
          Após isso, são eliminados ou anonimizados.
        </Sec>

        <Sec titulo="9. Cookies">
          Usamos apenas cookies essenciais de sessão/autenticação. Não usamos cookies de rastreamento
          de terceiros.
        </Sec>

        <Sec titulo="10. Alterações">
          Podemos atualizar esta Política. A versão vigente estará sempre nesta página, com a data de
          atualização.
        </Sec>

        <p className="mt-10 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-500">
          Este documento é um modelo inicial e não constitui aconselhamento jurídico. Recomendamos
          revisão por um advogado especializado em proteção de dados.
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
