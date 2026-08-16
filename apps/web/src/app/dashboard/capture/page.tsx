import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "@/lib/org";
import { sincronizarJobs, enriquecerDonos, donosPendentes } from "@/lib/captura";
import { CaptureForm } from "@/components/CaptureForm";
import { CaptureJobsTable, type CaptureJob } from "@/components/CaptureJobsTable";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function CapturePage() {
  const supabase = await createClient();

  // Importa (e qualifica) os resultados de buscas que já terminaram no Apify,
  // e enriquece um lote de leads com o nome do dono via CNPJ.
  const org = await getActiveOrg();
  let donosFaltando = 0;
  if (org) {
    try {
      await sincronizarJobs(org.orgId);
      await enriquecerDonos(org.orgId);
      donosFaltando = await donosPendentes(org.orgId);
    } catch {
      // se a sincronização falhar, a página continua carregando normalmente
    }
  }

  const { data } = await supabase
    .from("jobs_apify")
    .select("id, origem, termo_busca, localizacao, quantidade, status, criado_em")
    .order("criado_em", { ascending: false });

  const jobs = (data ?? []) as CaptureJob[];
  const emAndamento =
    donosFaltando > 0 || jobs.some((j) => j.status === "pendente" || j.status === "rodando");

  return (
    <div>
      {/* Atualiza sozinho enquanto houver captação em andamento */}
      <AutoRefresh ativo={emAndamento} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Captação de Leads</h1>
          <p className="mt-1 text-neutral-500">
            Capte leads pelo Google Maps ou Instagram e qualifique o feed (quem tem site e quem
            não tem).
          </p>
        </div>
        <CaptureForm />
      </div>
      {jobs.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-4xl">🎯</p>
          <h2 className="mt-3 font-medium text-neutral-900">Nenhuma captação ainda</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Registre sua primeira captação para começar a coletar leads.
          </p>
          <div className="mt-5 flex justify-center">
            <CaptureForm />
          </div>
        </div>
      ) : (
        <CaptureJobsTable jobs={jobs} />
      )}
    </div>
  );
}
