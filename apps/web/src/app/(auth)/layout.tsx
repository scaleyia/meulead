export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Meu<span className="text-emerald-400">Lead</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Capte, gerencie e converta seus leads.</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl">
          {children}
        </div>
      </div>
    </main>
  );
}
