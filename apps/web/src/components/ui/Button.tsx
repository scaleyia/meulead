import { clsx } from "@/lib/clsx";

type Variant = "primary" | "ghost" | "danger" | "outline";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:from-emerald-400 hover:to-emerald-500",
  outline:
    "border border-neutral-300 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-600/20 hover:from-red-400 hover:to-red-500",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
