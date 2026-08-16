// Mostrado instantaneamente ao navegar (enquanto a página carrega no servidor).
// Elimina a sensação de "travou" ao clicar.
export default function DashboardLoading() {
  return (
    <div className="anim-in">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-80 rounded-md" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="skeleton h-4 w-24 rounded-md" />
            <div className="skeleton mt-3 h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
