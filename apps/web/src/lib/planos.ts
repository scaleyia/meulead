// Planos do MeuLead — modelo de créditos (1 crédito = 1 lead captado).
// Preços/limites são placeholders — edite à vontade.
// `id` casa com organizacoes.plano; `creditosMes` renova todo mês.

export interface Plano {
  id: string;
  nome: string;
  preco: number; // R$/mês (0 = grátis)
  resumo: string;
  destaque?: boolean;
  creditosMes: number; // créditos inclusos por mês (1 crédito = 1 lead)
  recargaPreco: number; // R$ por crédito extra (recarga)
  limites: {
    chips: number;
    disparosDia: number;
  };
  recursos: string[];
}

export const PLANOS: Plano[] = [
  {
    id: "free",
    nome: "Grátis",
    preco: 0,
    resumo: "Para experimentar",
    creditosMes: 10,
    recargaPreco: 0.5,
    limites: { chips: 1, disparosDia: 20 },
    recursos: [
      "10 créditos por mês (10 leads)",
      "Captação Google Maps e Instagram",
      "1 número de WhatsApp",
      "CRM de status dos disparos",
    ],
  },
  {
    id: "starter",
    nome: "Starter",
    preco: 97,
    resumo: "Para começar a prospectar",
    creditosMes: 300,
    recargaPreco: 0.45,
    limites: { chips: 1, disparosDia: 200 },
    recursos: [
      "300 créditos por mês (300 leads)",
      "Qualificação: quem tem e quem não tem site",
      "Verificação de anúncios (Google e Meta)",
      "1 número de WhatsApp + aquecimento",
      "Recarga extra a R$ 0,45/crédito",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: 297,
    resumo: "O favorito de quem escala",
    destaque: true,
    creditosMes: 1200,
    recargaPreco: 0.35,
    limites: { chips: 3, disparosDia: 1000 },
    recursos: [
      "1.200 créditos por mês (1.200 leads)",
      "3 números (contingência)",
      "Revezamento automático de chips",
      "Aquecimento completo",
      "Recarga extra a R$ 0,35/crédito",
    ],
  },
  {
    id: "scale",
    nome: "Scale",
    preco: 697,
    resumo: "Para operações em volume",
    creditosMes: 4000,
    recargaPreco: 0.25,
    limites: { chips: 10, disparosDia: 5000 },
    recursos: [
      "4.000 créditos por mês (4.000 leads)",
      "Até 10 números",
      "Tudo do Pro incluso",
      "Suporte prioritário",
      "Recarga extra a R$ 0,25/crédito",
    ],
  },
];

export function planoPorId(id: string | null | undefined): Plano {
  return PLANOS.find((p) => p.id === id) ?? PLANOS[0];
}

export function formatarPreco(preco: number): string {
  if (preco === 0) return "Grátis";
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}
