"use client";

import Link from "next/link";
import { useActionState } from "react";

type ActionState = { error: string } | undefined;
type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isSignup && (
        <Field label="Nome da sua empresa">
          <input
            name="org_name"
            required
            placeholder="Ex: Agência Família Unida"
            className="input"
          />
        </Field>
      )}

      <Field label="E-mail">
        <input name="email" type="email" required placeholder="voce@empresa.com" className="input" />
      </Field>

      <Field label="Senha">
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="mínimo 6 caracteres"
          className="input"
        />
      </Field>

      {state?.error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white transition hover:bg-blue-400 disabled:opacity-60"
      >
        {pending ? "Aguarde…" : isSignup ? "Criar conta" : "Entrar"}
      </button>

      {isSignup && (
        <p className="text-center text-[11px] leading-snug text-neutral-400">
          Ao criar conta, você concorda com os{" "}
          <Link href="/termos" className="underline hover:text-neutral-600">
            Termos
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline hover:text-neutral-600">
            Política de Privacidade
          </Link>
          .
        </p>
      )}

      <p className="text-center text-sm text-neutral-500">
        {isSignup ? (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Criar agora
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
