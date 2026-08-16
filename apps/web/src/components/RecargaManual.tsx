"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { recarregarManual } from "@/app/dashboard/creditos/actions";

export function RecargaManual() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [qtd, setQtd] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const res = await recarregarManual(qtd);
          setMsg(res.ok ? `✓ ${qtd} créditos adicionados` : res.error);
          if (res.ok) router.refresh();
        });
      }}
    >
      <input
        type="number"
        min={1}
        value={qtd}
        onChange={(e) => setQtd(Number(e.target.value))}
        className="input max-w-[140px]"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Adicionando…" : "Adicionar créditos"}
      </Button>
      {msg && <span className="text-sm text-neutral-500">{msg}</span>}
    </form>
  );
}
