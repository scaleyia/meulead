"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Recarrega os dados do servidor em intervalos enquanto houver algo "em andamento"
// (ex: captação buscando → concluído), sem o usuário precisar apertar F5.
export function AutoRefresh({ ativo, intervaloMs = 4000 }: { ativo: boolean; intervaloMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!ativo) return;
    const t = setInterval(() => router.refresh(), intervaloMs);
    return () => clearInterval(t);
  }, [ativo, intervaloMs, router]);
  return null;
}
