import { clsx } from "@/lib/clsx";

type Variant = "primary" | "ghost" | "danger" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-400",
  outline: "border border-neutral-700 text-neutral-200 hover:bg-neutral-800",
  ghost: "text-neutral-300 hover:bg-neutral-800",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
