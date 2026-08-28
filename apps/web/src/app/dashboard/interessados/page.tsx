import { redirect } from "next/navigation";
import { getActiveOrg } from "@/lib/org";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function formatarData(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const PLANO_LABEL: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agencia: "Agência",
};

export default async function UsuariosPage() {
  const org = await getActiveOrg();
  if (!isAdmin(org?.email)) redirect("/dashboard");

  const admin = createAdminClient();

  // Usuários reais do sistema (auth) + a org de cada um.
  const [{ data: usersData }, { data: membros }, { data: orgs }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("membros").select("usuario_id, organizacao_id, papel"),
    admin.from("organizacoes").select("id, nome, plano, criado_em"),
  ]);

  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));
  const membroByUser = new Map((membros ?? []).map((m) => [m.usuario_id, m]));

  const rows = (usersData?.users ?? [])
    .map((u) => {
      const membro = membroByUser.get(u.id);
      const org = membro ? orgById.get(membro.organizacao_id) : undefined;
      return {
        id: u.id,
        email: u.email ?? "—",
        criadoEm: u.created_at,
        ultimoLogin: u.last_sign_in_at,
        orgNome: org?.nome ?? "—",
        plano: org?.plano ?? "free",
        papel: membro?.papel ?? "—",
      };
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Contas ativas no sistema — quem se cadastrou no MeuLead.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-12 text-center">
          <p className="text-4xl">👤</p>
          <h2 className="mt-3 font-medium text-neutral-900 dark:text-neutral-100">Nenhum usuário ainda</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Assim que alguém criar uma conta, aparece aqui.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            {rows.length} {rows.length === 1 ? "usuário" : "usuários"}
          </p>
          <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Papel</th>
                  <th className="px-4 py-3 font-medium">Cadastro</th>
                  <th className="px-4 py-3 font-medium">Último acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">{u.email}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{u.orgNome}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">
                      {PLANO_LABEL[u.plano] ?? u.plano}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{u.papel}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{formatarData(u.criadoEm)}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{formatarData(u.ultimoLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
