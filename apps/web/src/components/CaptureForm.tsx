"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { criarJob } from "@/app/dashboard/capture/actions";

type Modo = "google_maps" | "instagram";

export function CaptureForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("google_maps");

  return (
    <Modal
      title="Nova captação"
      description="Escolha a fonte e o que quer buscar."
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
            const nomeLista = String(fd.get("nomeLista") ?? "").trim();
            const termoBusca = String(fd.get("termoBusca") ?? "").trim();
            if (!termoBusca) return setError("Informe o que você quer buscar.");
            const localizacao = String(fd.get("localizacao") ?? "").trim();

            start(async () => {
              const res = await criarJob({
                origem: modo,
                termoBusca,
                localizacao,
                quantidade,
                nomeLista,
              });
              if (!res.ok) return setError(res.error);
              close();
              router.refresh();
            });
          }}
        >
          {/* Seletor de fonte */}
          <div className="grid grid-cols-2 gap-2">
            <ModoCard
              ativo={modo === "google_maps"}
              onClick={() => setModo("google_maps")}
              titulo="🗺️ Google Maps"
              sub="Negócios locais — com site, nota e endereço"
            />
            <ModoCard
              ativo={modo === "instagram"}
              onClick={() => setModo("instagram")}
              titulo="📸 Instagram"
              sub="Perfis por nicho — com seguidores e link"
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Nome da lista</span>
            <input
              name="nomeLista"
              placeholder="Ex: Restaurantes SP — campanha agosto"
              maxLength={80}
              className="input"
            />
            <span className="text-xs text-neutral-500">
              Dê um nome pra reconhecer no CRM. Se deixar vazio, geramos automaticamente.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              {modo === "instagram" ? "Nicho / palavra-chave" : "O que buscar"}
            </span>
            <input
              name="termoBusca"
              required
              placeholder={
                modo === "instagram"
                  ? "Ex: hamburgueria, estúdio de tatuagem, petshop"
                  : "Ex: restaurantes, clínicas de estética, academias"
              }
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              {modo === "instagram" ? "Localização (recomendado)" : "Localização (opcional)"}
            </span>
            <input name="localizacao" placeholder="Ex: São Paulo, SP" className="input" />
            {modo === "instagram" && (
              <span className="text-xs text-neutral-500">
                O termo em português já traz perfis brasileiros. Informar a cidade/estado ajuda a
                focar ainda mais na sua região.
              </span>
            )}
          </label>

          <div
            className={`rounded-md px-3 py-2 text-xs ${
              modo === "instagram"
                ? "bg-fuchsia-500/10 text-fuchsia-700"
                : "bg-emerald-500/10 text-emerald-700"
            }`}
          >
            {modo === "instagram" ? (
              <>
                Traz <strong>perfis do nicho</strong> com seguidores, link da bio e contato quando
                público. Ideal pra ver presença digital.
              </>
            ) : (
              <>
                Traz o <strong>negócio</strong> com telefone, <strong>site (ou a falta dele)</strong>
                , nota e endereço — perfeito pra qualificar e prospectar.
              </>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Quantidade</span>
            <input name="quantidade" type="number" defaultValue={20} min={1} max={120} className="input" />
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
              {pending ? "Iniciando…" : "Captar leads"}
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
