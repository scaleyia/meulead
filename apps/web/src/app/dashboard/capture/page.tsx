import { createClient } from "@/lib/supabase/server";
import { CaptureForm } from "@/components/CaptureForm";
import { CaptureJobsTable, type CaptureJob } from "@/components/CaptureJobsTable";

export default async function CapturePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs_apify")
    .select("id, origem, termo_busca, localizacao, quantidade, status, criado_em")
    .order("criado_em", { ascending: false });

  const jobs = (data ?? []) as CaptureJob[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Captação de Leads</h1>
          <p className="mt-1 text-neutral-500">
            Capte o contato do dono por segmento e acompanhe cada busca.
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
