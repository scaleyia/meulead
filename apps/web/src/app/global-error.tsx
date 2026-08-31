"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";

// Captura erros que estouram no PRÓPRIO root layout (fonte, tema, etc.).
// Como substitui o layout raiz, precisa trazer <html> e <body> próprios.
// Estilo inline pra garantir renderização mesmo sem o CSS global.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Algo deu errado
          </h1>
          <p style={{ color: "#a3a3a3", fontSize: "0.925rem", margin: "0 0 1.5rem" }}>
            Tivemos um problema ao carregar o MeuLead. Tente novamente — se
            persistir, fale com o suporte.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={() => retry()}
              style={{
                borderRadius: 8,
                border: 0,
                background: "#fafafa",
                color: "#0a0a0a",
                padding: "0.6rem 1.1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tentar de novo
            </button>
            <a
              href="/lp"
              style={{
                borderRadius: 8,
                border: "1px solid #404040",
                color: "#fafafa",
                padding: "0.6rem 1.1rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Ir para o início
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
