// Mini helper para juntar classes condicionalmente (sem dependência externa).
export function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
