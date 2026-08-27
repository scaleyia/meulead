// Botão flutuante de WhatsApp — suporte para leads/clientes.
// Número vem da env NEXT_PUBLIC_WHATSAPP_SUPORTE (só dígitos, com DDI 55).
// Ex.: NEXT_PUBLIC_WHATSAPP_SUPORTE=5511912345678
const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE || "5511900000000";
const MSG = "Olá! Vim pelo MeuLead e queria falar com o suporte.";

export function WhatsappFab() {
  const href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MSG)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte no WhatsApp"
      title="Falar com o suporte no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105 hover:bg-[#1fb955] active:scale-95 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.04 4C9.42 4 4.03 9.39 4.03 16c0 2.11.55 4.16 1.6 5.97L4 28l6.2-1.62A11.9 11.9 0 0 0 16.04 28C22.66 28 28 22.61 28 16S22.66 4 16.04 4Zm0 21.82c-1.86 0-3.68-.5-5.27-1.44l-.38-.22-3.68.96.98-3.58-.25-.37a9.8 9.8 0 0 1-1.5-5.17c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.96c0 5.44-4.43 9.86-9.86 9.86Zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
