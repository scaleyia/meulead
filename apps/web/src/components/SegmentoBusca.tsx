"use client";

import { useMemo, useState } from "react";
import { CNAES } from "@/lib/cnaes";

// Deixa o texto (que vem em CAIXA ALTA do IBGE) bonito.
function bonito(s: string) {
  return s
    .toLowerCase()
    .replace(/(^|\s|\/|-)\p{L}/gu, (m) => m.toUpperCase());
}

// Combobox de busca de nicho (CNAE) — no estilo do sistema (não usa datalist nativo).
export function SegmentoBusca() {
  const [q, setQ] = useState("");
  const [cnae, setCnae] = useState("");
  const [open, setOpen] = useState(false);

  const resultados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const startsWith: typeof CNAES = [];
    const contains: typeof CNAES = [];
    for (const c of CNAES) {
      const l = c.label.toLowerCase();
      if (l.startsWith(term)) startsWith.push(c);
      else if (l.includes(term)) contains.push(c);
      if (startsWith.length + contains.length > 40) break;
    }
    return [...startsWith, ...contains].slice(0, 8);
  }, [q]);

  return (
    <div className="relative">
      <input type="hidden" name="cnae" value={cnae} />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setCnae("");
          setOpen(true);
        }}
        onFocus={() => q.trim().length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Digite: restaurantes, dentistas, manipulação…"
        className="input"
        autoComplete="off"
      />

      {open && resultados.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-1 shadow-lg">
          {resultados.map((c) => (
            <li key={c.cnae}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCnae(c.cnae);
                  setQ(bonito(c.label));
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="truncate text-neutral-800 dark:text-neutral-100">{bonito(c.label)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
