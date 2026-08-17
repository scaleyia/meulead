"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

export interface TourStep {
  selector?: string;
  title: string;
  text: string;
}

// Tour guiado (spotlight + tooltip) com Próximo/Voltar/Pular.
// Auto-inicia uma vez (guarda no localStorage); pode ser reiniciado disparando
// o evento window "meulead:start-tour".
export function Tour({ steps, storageKey }: { steps: TourStep[]; storageKey: string }) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => setMounted(true), []);

  const start = useCallback(() => {
    setI(0);
    setActive(true);
  }, []);

  // Auto-início na primeira visita.
  useEffect(() => {
    if (!mounted) return;
    let done = false;
    try {
      done = localStorage.getItem(storageKey) === "1";
    } catch {
      done = false;
    }
    if (!done) {
      const t = setTimeout(start, 700);
      return () => clearTimeout(t);
    }
  }, [mounted, storageKey, start]);

  // Reinício manual (botão "Fazer tour").
  useEffect(() => {
    const h = () => start();
    window.addEventListener("meulead:start-tour", h);
    return () => window.removeEventListener("meulead:start-tour", h);
  }, [start]);

  const step = steps[i];

  const medir = useCallback(() => {
    if (!active || !step?.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.selector);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [active, step]);

  useLayoutEffect(() => {
    medir();
  }, [medir, i]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, true);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir, true);
    };
  }, [active, medir]);

  const fim = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }, [storageKey]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fim();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, fim]);

  if (!mounted || !active || !step) return null;

  function prox() {
    if (i < steps.length - 1) setI(i + 1);
    else fim();
  }
  function ant() {
    if (i > 0) setI(i - 1);
  }

  const pad = 8;
  const cardW = 320;
  let top = 0;
  let left = 0;
  let centered = false;
  if (rect) {
    left = rect.right + 16;
    top = rect.top;
    if (left + cardW > window.innerWidth - 12) {
      left = Math.min(rect.left, window.innerWidth - cardW - 12);
      top = rect.bottom + 12;
    }
    top = Math.max(12, Math.min(top, window.innerHeight - 240));
    left = Math.max(12, left);
  } else {
    centered = true;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Bloqueia cliques na página; dim total quando não há alvo. */}
      <div
        className="absolute inset-0"
        style={{ background: rect ? "transparent" : "rgba(15,23,42,0.55)" }}
      />
      {/* Spotlight no alvo. */}
      {rect && (
        <div
          className="absolute rounded-xl ring-2 ring-emerald-400 transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.55)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Card. */}
      <div
        className="anim-in absolute w-[320px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"
        style={
          centered
            ? { top: "50%", left: "50%", transform: "translate(-50%,-50%)" }
            : { top, left }
        }
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600">
            Passo {i + 1} de {steps.length}
          </span>
          <button onClick={fim} className="text-xs text-neutral-400 hover:text-neutral-700">
            Pular ✕
          </button>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-neutral-900">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">{step.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {steps.map((_, k) => (
              <span
                key={k}
                className={`h-1.5 rounded-full transition-all ${
                  k === i ? "w-4 bg-emerald-500" : "w-1.5 bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button
                onClick={ant}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
              >
                Voltar
              </button>
            )}
            <button
              onClick={prox}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-400"
            >
              {i === steps.length - 1 ? "Concluir 🚀" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
