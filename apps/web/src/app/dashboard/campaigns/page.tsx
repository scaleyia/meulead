import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/CampaignForm";
import { CampaignsTable } from "@/components/CampaignsTable";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const [{ data: campanhas }, { data: listas }, { data: sessoes }, { data: alvos }] =
    await Promise.all([
      supabase
        .from("campanhas")
        .select("id, nome, status, modo_envio, criado_em, agendada_para")
        .order("criado_em", { ascending: false }),
      // Instagram não tem telefone — só listas disparáveis (Google Maps, import, manual).
      supabase
        .from("listas")
        .select("id, nome")
        .or("origem.is.null,origem.neq.instagram")
        .order("criado_em", { ascending: false }),
      supabase
        .from("sessoes_whatsapp")
        .select("id, nome, status")
        .order("criado_em", { ascending: false }),
      supabase.from("campanha_alvos").select("campanha_id, status"),
    ]);

  // Agrega métricas por campanha.
  const metricasPorCampanha = new Map<
    string,
    { total: number; enviados: number; entregues: number; falhou: number }
  >();
  for (const a of alvos ?? []) {
    const m =
      metricasPorCampanha.get(a.campanha_id) ??
      { total: 0, enviados: 0, entregues: 0, falhou: 0 };
    m.total++;
    const s = (a.status ?? "").toLowerCase();
    if (s === "enviado") m.enviados++;
    else if (s === "entregue" || s === "lido") m.entregues++;
    else if (s === "falhou") m.falhou++;
    metricasPorCampanha.set(a.campanha_id, m);
  }

  const rows = (campanhas ?? []).map((c) => ({
    ...c,
    metricas: metricasPorCampanha.get(c.id) ?? { total: 0, enviados: 0, entregues: 0, falhou: 0 },
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Disparador</h1>
          <p className="mt-1 text-neutral-500">
            Crie campanhas de disparo em massa no WhatsApp com revezamento de chips.
          </p>
        </div>
        <CampaignForm listas={listas ?? []} sessoes={sessoes ?? []} />
      </div>
      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-4xl">🚀</p>
          <h2 className="mt-3 font-medium text-neutral-900">Nenhuma campanha ainda</h2>
          <p className="mt-1 text-sm text-neutral-500">
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
