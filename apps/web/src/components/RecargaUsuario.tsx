"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { recarregarUsuario } from "@/app/dashboard/creditos/actions";

export interface UsuarioOption {
  orgId: string;
  label: string;
}

export function RecargaUsuario({ usuarios }: { usuarios: UsuarioOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [orgId, setOrgId] = useState("");
  const [qtd, setQtd] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const res = await recarregarUsuario(orgId, qtd);
          setMsg(res.ok ? `✓ ${qtd} créditos adicionados` : res.error);
          if (res.ok) router.refresh();
        });
      }}
    >
      <select
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        className="input max-w-xs"
        required
      >
        <option value="">— Escolha o usuário —</option>
        {usuarios.map((u) => (
          <option key={u.orgId} value={u.orgId}>
            {u.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        value={qtd}
        onChange={(e) => setQtd(Number(e.target.value))}
        className="input max-w-[120px]"
      />
      <Button type="submit" disabled={pending || !orgId}>
        {pending ? "Adicionando…" : "Dar créditos"}
      </Button>
      {msg && <span className="text-sm text-neutral-500">{msg}</span>}
    </form>
  );
}
