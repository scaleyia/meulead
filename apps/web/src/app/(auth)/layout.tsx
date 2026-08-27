export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MeuLead" className="mx-auto h-20 w-20 rounded-2xl" />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-xl">
          {children}
        </div>
      </div>
    </main>
  );
}
