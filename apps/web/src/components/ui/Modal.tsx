"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "@/lib/clsx";

// Modal reutilizável. `children` é uma função que recebe `close`
// para o formulário conseguir fechar o modal após enviar.
export function Modal({
  trigger,
  title,
  description,
  children,
}: {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {trigger(() => setOpen(true))}
      {mounted &&
        open &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/20 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className={clsx(
              "anim-in w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6",
              "shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/5",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
              {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
            </div>
            {children(() => setOpen(false))}
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
