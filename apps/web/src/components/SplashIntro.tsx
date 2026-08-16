"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Animação de abertura (muda) sobre fundo branco, ao entrar na conta.
// Some quando o vídeo termina, ou ao pular, ou por segurança após um tempo.
export function SplashIntro() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const [oculto, setOculto] = useState(false);

  function encerrar() {
    if (saindo) return;
    setSaindo(true);
    // Fade-out e depois limpa a URL (evita repetir no refresh).
    setTimeout(() => {
      setOculto(true);
      router.replace("/dashboard");
    }, 500);
  }

  useEffect(() => {
    // Fallback: se o vídeo travar/não tocar, não deixa a tela branca presa.
    const t = setTimeout(encerrar, 12000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (oculto) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-500 ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={encerrar}
        onError={encerrar}
        className="max-h-full max-w-full object-contain"
      />
      <button
        onClick={encerrar}
        className="absolute bottom-6 right-6 rounded-full bg-black/5 px-4 py-1.5 text-sm text-neutral-500 transition hover:bg-black/10"
      >
        Pular ›
      </button>
    </div>
  );
}
