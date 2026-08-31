"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { criarJob } from "@/app/dashboard/capture/actions";
import { SegmentoBusca } from "@/components/SegmentoBusca";

type Modo = "google_maps" | "instagram";
type MetodoIG = "hashtag" | "local";

export function CaptureForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("google_maps");
  const [metodo, setMetodo] = useState<MetodoIG>("hashtag");

  const ehIG = modo === "instagram";

  return (
    <Modal
      title="Nova captação"
      description="Escolha a fonte e o que quer buscar."
      trigger={(open) => (
        <Button onClick={open} data-tour="nova-captacao">
          + Nova captação
        </Button>
      )}
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
            const localizacao = String(fd.get("localizacao") ?? "").trim();
            const cnae = String(fd.get("cnae") ?? "").trim();

            if (!termoBusca) {
              return setError(
                ehIG && metodo === "hashtag"
                  ? "Informe ao menos uma hashtag."
                  : "Informe o que você quer buscar.",
              );
            }
            if (ehIG && metodo === "local" && !localizacao) {
              return setError("Informe a localização (cidade) para buscar por local.");
            }

            start(async () => {
              const res = await criarJob({
                origem: modo,
                termoBusca,
                localizacao,
                quantidade,
                nomeLista,
                cnae,
                metodo: ehIG ? metodo : undefined,
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
              sub="Perfis comerciais por hashtag ou localização"
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Nome da lista</span>
            <input
              name="nomeLista"
              placeholder="Ex: Clínicas Caruaru — campanha agosto"
              maxLength={80}
              className="input"
            />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Dê um nome pra reconhecer no CRM. Se deixar vazio, geramos automaticamente.
            </span>
          </label>

          {/* ----- Campos específicos do Instagram ----- */}
          {ehIG && (
            <div className="grid grid-cols-2 gap-2">
              <ModoCard
                ativo={metodo === "hashtag"}
                onClick={() => setMetodo("hashtag")}
                titulo="#️⃣ Por hashtag"
                sub="Quem posta em hashtags do nicho"
              />
              <ModoCard
                ativo={metodo === "local"}
                onClick={() => setMetodo("local")}
                titulo="📍 Por localização"
                sub="Quem posta na sua cidade"
              />
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {ehIG
                ? metodo === "hashtag"
                  ? "Hashtags"
                  : "Nicho / palavra-chave"
                : "O que buscar"}
            </span>
            <input
              name="termoBusca"
              required
              placeholder={
                ehIG
                  ? metodo === "hashtag"
                    ? "Ex: clinicacaruaru, harmonizacaofacial, esteticacaruaru"
                    : "Ex: clínica de estética, hamburgueria, petshop"
                  : "Ex: restaurantes, clínicas de estética, academias"
              }
              className="input"
            />
            {ehIG && metodo === "hashtag" && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Separe por vírgula. Não precisa do <strong>#</strong>. Hashtags de nicho +
                cidade trazem negócios locais (ex: <em>#clinicacaruaru</em>).
              </span>
            )}
          </label>

          {/* Localização: sempre no Google Maps; no IG só no método "local" */}
          {(!ehIG || metodo === "local") && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Localização {ehIG ? "(obrigatória)" : "(recomendado)"}
              </span>
              <input name="localizacao" placeholder="Ex: Caruaru, PE" className="input" />
            </label>
          )}

          {!ehIG && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Segmento — para achar o dono (opcional)
              </span>
              <SegmentoBusca />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Escolha o segmento na lista pra o sistema descobrir o <strong>nome do dono</strong>.
                A <strong>cidade é detectada automaticamente</strong> pelos leads — não precisa se
                preocupar com o formato da localização.
              </span>
            </label>
          )}

          <div
            className={`rounded-md px-3 py-2 text-xs ${
              ehIG
                ? "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
            }`}
          >
            {ehIG ? (
              <>
                Traz <strong>perfis comerciais</strong> do nicho — só contas de negócio (com
                seguidores, link da bio e contato quando público). Perfis pessoais e celebridades
                são <strong>filtrados</strong>.
              </>
            ) : (
              <>
                Traz o <strong>negócio</strong> com telefone, <strong>site (ou a falta dele)</strong>
                , nota e endereço — perfeito pra qualificar e prospectar.
              </>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Quantidade</span>
            <input
              name="quantidade"
              type="number"
              defaultValue={20}
              min={1}
              max={ehIG ? 100 : 120}
              className="input"
            />
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
          ? "border-blue-500/50 bg-blue-500/10"
          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300"
      }`}
    >
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{titulo}</p>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{sub}</p>
    </button>
  );
}
