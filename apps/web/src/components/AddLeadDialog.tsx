"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { addLead } from "@/app/dashboard/lists/[id]/actions";

export function AddLeadDialog({ listId }: { listId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      title="Adicionar lead"
      description="Cadastre um contato manualmente nesta lista."
      trigger={(open) => <Button onClick={open}>+ Lead</Button>}
    >
      {(close) => (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const input = {
              name: String(fd.get("name") ?? ""),
              company: String(fd.get("company") ?? ""),
              phone: String(fd.get("phone") ?? ""),
              email: String(fd.get("email") ?? ""),
            };
            if (!input.name && !input.company && !input.phone && !input.email) {
              setError("Preencha ao menos um campo.");
              return;
            }
            start(async () => {
              const res = await addLead(listId, input);
              if (!res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          <input name="name" autoFocus placeholder="Nome" className="input" />
          <input name="company" placeholder="Empresa" className="input" />
          <input name="phone" placeholder="Telefone / WhatsApp" className="input" />
          <input name="email" type="email" placeholder="E-mail" className="input" />

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
