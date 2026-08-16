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
      <WhatsappPanel
        sessoes={(sessoes ?? []).map((s) => ({
          ...s,
          aquecimento_config: (s.aquecimento_config ?? null) as Sessao["aquecimento_config"],
        }))}
      />
    </div>
  );
}
