"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { criarJob } from "@/app/dashboard/capture/actions";
import { UFS } from "@/lib/segmentos";
import { CNAES } from "@/lib/cnaes";

type Modo = "donos" | "google_maps";

export function CaptureForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("donos");

  return (
    <Modal
      title="Nova captação"
      description="Escolha como quer captar os leads."
      trigger={(open) => <Button onClick={open}>+ Nova captação</Button>}
    >
      {(close) => (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const quantidade = Number(fd.get("quantidade") ?? 20);

            if (modo === "donos") {
              const uf = String(fd.get("uf") ?? "");
              // O usuário busca o nicho e escolhe uma opção "Descrição · 5611201".
              const raw = String(fd.get("segmentoBusca") ?? "");
              const codigo = raw.match(/(\d{7})\s*$/)?.[1] ?? "";
              const item = CNAES.find((c) => c.cnae === codigo);
              if (!item) {
                return setError("Digite o nicho e escolha uma opção da lista.");
              }
              start(async () => {
                const res = await criarJob({
                  origem: "cnpj",
                  cnae: item.cnae,
                  segmentoLabel: item.label,
                  uf,
                  quantidade,
                });
                if (!res.ok) return setError(res.error);
                close();
                router.refresh();
              });
              return;
            }

            const termoBusca = String(fd.get("termoBusca") ?? "");
            const localizacao = String(fd.get("localizacao") ?? "");
            if (!termoBusca.trim()) return setError("Informe o termo de busca.");
            start(async () => {
              const res = await criarJob({ origem: "google_maps", termoBusca, localizacao, quantidade });
              if (!res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          {/* Seletor de modo */}
          <div className="grid grid-cols-2 gap-2">
            <ModoCard
              ativo={modo === "donos"}
              onClick={() => setModo("donos")}
              titulo="👤 Donos"
              sub="Nome + telefone do dono (por segmento)"
            />
            <ModoCard
              ativo={modo === "google_maps"}
              onClick={() => setModo("google_maps")}
              titulo="🗺️ Google Maps"
              sub="Número comercial (por termo)"
            />
          </div>

          {modo === "donos" ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-neutral-700">Nicho (segmento)</span>
                <input
                  name="segmentoBusca"
                  list="cnae-list"
                  autoComplete="off"
                  autoFocus
                  placeholder="Digite: restaurantes, dentistas, manipulação…"
                  className="input"
                />
                <datalist id="cnae-list">
                  {CNAES.map((c) => (
                    <option key={c.cnae} value={`${c.label} · ${c.cnae}`} />
                  ))}
                </datalist>
                <span className="text-xs text-neutral-500">
                  Digite o nicho e <strong>escolha uma opção da lista</strong> — traz o dono daquele
                  segmento.
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-neutral-700">Estado</span>
                <select name="uf" defaultValue="SP" className="input">
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>

              <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                Traz <strong>nome do dono</strong> (sócio) + telefone e e-mail registrados na Receita
                (empresas de pequeno porte).
              </p>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-neutral-700">Termo de busca</span>
                <input name="termoBusca" required placeholder="Ex: restaurantes" className="input" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-neutral-700">Localização (opcional)</span>
                <input name="localizacao" placeholder="Ex: São Paulo, SP" className="input" />
              </label>
              <p className="rounded-md bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
                Traz o <strong>número comercial</strong> da loja (público no Google Maps) — nem sempre é
                o dono.
              </p>
            </>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Quantidade</span>
            <input name="quantidade" type="number" defaultValue={20} min={1} max={500} className="input" />
            <span className="text-xs text-amber-600">
              ⚡ Cada lead captado usa 1 crédito (limitado ao seu saldo).
            </span>
          </label>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Captando…" : "Captar leads"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ModoCard({
  ativo,
  onClick,
  titulo,
  sub,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        ativo
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
      }`}
    >
      <p className="text-sm font-medium text-neutral-900">{titulo}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>
    </button>
  );
}
