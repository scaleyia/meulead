import { createClient } from "@/lib/supabase/server";
import { WhatsappPanel, type Sessao } from "@/components/WhatsappPanel";

export default async function WhatsappPage() {
  const supabase = await createClient();

  const { data: sessoes } = await supabase
    .from("sessoes_whatsapp")
    .select(
      "id, nome, instancia, numero, status, aquecimento_ativo, aquecimento_config, criado_em",
    )
    .order("criado_em", { ascending: true });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Conectar WhatsApp</h1>
        <p className="mt-1 text-neutral-500">
          Conecte o número que será usado para os disparos das suas campanhas.
        </p>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <span className="text-lg leading-none">ℹ️</span>
        <p className="text-sm text-emerald-700">
          A leitura do <strong>QR code</strong> via Evolution API será ativada com as credenciais da
          sua VPS. Cada número conectado aqui fica disponível para escolher no{" "}
          <strong>Disparador</strong>.
        </p>
      </div>

      <WhatsappPanel
        sessoes={(sessoes ?? []).map((s) => ({
          ...s,
          aquecimento_config: (s.aquecimento_config ?? null) as Sessao["aquecimento_config"],
        }))}
      />
    </div>
  );
}
