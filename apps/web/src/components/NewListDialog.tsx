"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SOURCE_LABELS, SOURCE_OPTIONS } from "@/lib/sources";
import { createList } from "@/app/dashboard/lists/actions";

export function NewListDialog() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      title="Nova lista de leads"
      description="Organize seus leads por campanha, nicho ou origem."
      trigger={(open) => <Button onClick={open}>+ Nova lista</Button>}
    >
      {(close) => (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") ?? "");
            const source = String(fd.get("source") ?? "");
            start(async () => {
              const res = await createList(name, source);
              if (!res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Nome da lista</span>
            <input name="name" required autoFocus placeholder="Ex: Restaurantes SP" className="input" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Origem (opcional)</span>
            <select name="source" defaultValue="manual" className="input">
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando…" : "Criar lista"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
