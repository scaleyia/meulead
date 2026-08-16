import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/CampaignForm";
import { CampaignsTable } from "@/components/CampaignsTable";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const [{ data: campanhas }, { data: listas }, { data: sessoes }] = await Promise.all([
    supabase
      .from("campanhas")
      .select("id, nome, status, modo_envio, criado_em")
      .order("criado_em", { ascending: false }),
    supabase.from("listas").select("id, nome").order("criado_em", { ascending: false }),
    supabase
      .from("sessoes_whatsapp")
      .select("id, nome, status")
      .order("criado_em", { ascending: false }),
  ]);

  const rows = campanhas ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Disparador</h1>
          <p className="mt-1 text-neutral-400">
            Crie campanhas de disparo em massa no WhatsApp com revezamento de chips.
          </p>
        </div>
        <CampaignForm listas={listas ?? []} sessoes={sessoes ?? []} />
      </div>

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-neutral-300">
        O envio é processado pelo n8n + Evolution API, com revezamento entre os chips e
        intervalos seguros. Conecte seus números em Conectar WhatsApp.
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
          <p className="text-4xl">🚀</p>
          <h2 className="mt-3 font-medium text-white">Nenhuma campanha ainda</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Crie sua primeira campanha para começar a disparar mensagens.
          </p>
          <div className="mt-5 flex justify-center">
            <CampaignForm listas={listas ?? []} sessoes={sessoes ?? []} />
          </div>
        </div>
      ) : (
        <CampaignsTable campanhas={rows} />
      )}
    </div>
  );
}
