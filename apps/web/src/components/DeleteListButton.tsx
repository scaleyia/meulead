"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteList } from "@/app/dashboard/lists/actions";

export function DeleteListButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      title="Excluir lista"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        if (!confirm(`Excluir a lista "${name}" e desvincular seus leads?`)) return;
        start(async () => {
          await deleteList(id);
          router.refresh();
        });
      }}
      className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs text-red-600 hover:bg-red-500/10"
    >
      {pending ? "…" : "Excluir"}
    </button>
  );
}
