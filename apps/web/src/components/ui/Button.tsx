import { clsx } from "@/lib/clsx";

type Variant = "primary" | "ghost" | "danger" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-400",
  outline: "border border-neutral-300 text-neutral-800 hover:bg-neutral-100",
  ghost: "text-neutral-700 hover:bg-neutral-100",
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
