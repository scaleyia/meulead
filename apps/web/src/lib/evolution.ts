// Cliente server-side da Evolution API (WhatsApp via Baileys).
// Usado nas Server Actions de conexão. As credenciais vivem só no servidor.

const BASE = process.env.EVOLUTION_API_URL ?? "";
const KEY = process.env.EVOLUTION_API_KEY ?? "";

export const evolutionConfigurada = BASE.startsWith("http") && KEY.length > 8;

async function evo(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export type EstadoWhats = "conectado" | "conectando" | "desconectado";

function mapState(state?: string): EstadoWhats {
  if (state === "open") return "conectado";
  if (state === "connecting") return "conectando";
  return "desconectado";
}

// Cria (se preciso) e conecta a instância, retornando o QR em base64.
export async function conectarInstancia(
  instancia: string,
): Promise<{ ok: true; qr: string | null; pairingCode: string | null } | { ok: false; error: string }> {
  try {
    // Instância já existe? pega o QR direto.
    const r = await evo(`/instance/connect/${encodeURIComponent(instancia)}`);
    if (r.ok) {
      const d = await r.json();
      return { ok: true, qr: d.base64 ?? null, pairingCode: d.pairingCode ?? null };
    }

    // Não existe → cria com QR.
    const c = await evo(`/instance/create`, {
      method: "POST",
      body: JSON.stringify({
        instanceName: instancia,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
      }),
    });
    if (!c.ok) {
      const t = await c.text();
      return { ok: false, error: `Evolution: ${c.status} ${t.slice(0, 120)}` };
    }
    const d = await c.json();
    return { ok: true, qr: d.qrcode?.base64 ?? null, pairingCode: d.qrcode?.pairingCode ?? null };
  } catch (e) {
    return { ok: false, error: `Falha ao falar com a Evolution: ${(e as Error).message}` };
  }
}

// Consulta o estado da conexão da instância.
export async function estadoInstancia(
  instancia: string,
): Promise<{ estado: EstadoWhats; numero: string | null }> {
  try {
    const r = await evo(`/instance/connectionState/${encodeURIComponent(instancia)}`);
    if (!r.ok) return { estado: "desconectado", numero: null };
    const d = await r.json();
    const estado = mapState(d?.instance?.state);
    const numero = d?.instance?.ownerJid ? String(d.instance.ownerJid).split("@")[0] : null;
    return { estado, numero };
  } catch {
    return { estado: "desconectado", numero: null };
  }
}

// Desconecta (logout) a instância — mantém a instância criada.
export async function desconectarInstancia(instancia: string): Promise<void> {
  try {
    await evo(`/instance/logout/${encodeURIComponent(instancia)}`, { method: "DELETE" });
  } catch {
    // silencioso
  }
}

// Checa quais números têm WhatsApp. Retorna um mapa numero(dígitos) -> boolean.
export async function checarNumerosWhatsapp(
  instancia: string,
  numeros: string[],
): Promise<Map<string, boolean>> {
  const mapa = new Map<string, boolean>();
  if (numeros.length === 0) return mapa;
  try {
    const r = await evo(`/chat/whatsappNumbers/${encodeURIComponent(instancia)}`, {
      method: "POST",
      body: JSON.stringify({ numbers: numeros }),
    });
    if (!r.ok) return mapa;
    const d = await r.json();
    const arr: Record<string, unknown>[] = Array.isArray(d) ? d : (d?.onWhatsapp ?? []);
    for (const item of arr) {
      const num = String(item.number ?? item.jid ?? "").replace(/\D/g, "");
      const existe = Boolean(item.exists ?? item.onWhatsapp ?? false);
      if (num) mapa.set(num, existe);
    }
  } catch {
    // silencioso — quem chamou trata como "não checado"
  }
  return mapa;
}

// Remove a instância por completo.
export async function excluirInstancia(instancia: string): Promise<void> {
  try {
    await evo(`/instance/delete/${encodeURIComponent(instancia)}`, { method: "DELETE" });
  } catch {
    // silencioso
  }
}
