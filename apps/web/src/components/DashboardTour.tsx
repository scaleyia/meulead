"use client";

import { Tour, type TourStep } from "@/components/Tour";

const STEPS: TourStep[] = [
  {
    title: "Bem-vindo ao MeuLead 👋",
    text: "Vou te mostrar em 1 minuto como o sistema funciona, do lead ao fechamento. Pode pular quando quiser.",
  },
  {
    selector: '[data-tour="/dashboard"]',
    title: "Início",
    text: "Seu painel de controle: leads captados, quantos estão sem site, quais são os quentes e seu saldo de créditos.",
  },
  {
    selector: '[data-tour="/dashboard/capture"]',
    title: "1) Captação",
    text: "É por aqui que tudo começa. Busque por nicho no Google Maps ou no Instagram e o sistema traz os leads com telefone, site, nota e mais.",
  },
  {
    selector: '[data-tour="/dashboard/leads"]',
    title: "2) Leads",
    text: "Todos os seus leads numa tabela. Veja quem NÃO tem site, valide o WhatsApp, analise a qualidade do site e exporte pra Excel/CSV.",
  },
  {
    selector: '[data-tour="/dashboard/lists"]',
    title: "Listas",
    text: "Cada captação vira uma lista. Aqui você as organiza e abre uma por uma.",
  },
  {
    selector: '[data-tour="/dashboard/oportunidades"]',
    title: "3) Oportunidades",
    text: "O ouro: leads ranqueados por potencial. Quem já anuncia e não tem site aparece no topo como 🔥 quente — pronto pra vender.",
  },
  {
    selector: '[data-tour="/dashboard/whatsapp"]',
    title: "4) Conexões",
    text: "Conecte o número de WhatsApp que fará os disparos. Dá pra ligar mais de um para revezar (anti-bloqueio).",
  },
  {
    selector: '[data-tour="/dashboard/campaigns"]',
    title: "5) Disparos",
    text: "Crie campanhas de WhatsApp com modelos de mensagem prontos, revezamento de chips e follow-up. Acompanhe enviados e entregues.",
  },
  {
    selector: '[data-tour="/dashboard/crm"]',
    title: "6) CRM",
    text: "Acompanhe cada lead pelo status do disparo (não disparado, enviado, entregue…). Arraste os cards entre as colunas.",
  },
  {
    selector: '[data-tour="/dashboard/creditos"]',
    title: "Créditos",
    text: "1 crédito = 1 lead captado. Compre pacotes avulsos ou assine um plano com créditos que renovam todo mês.",
  },
  {
    selector: '[data-tour="/dashboard/capture"]',
    title: "Agora é a sua vez! 🚀",
    text: "É só clicar em Captação, escolher a fonte (Google Maps ou Instagram), o nicho e a cidade — e seus primeiros leads começam a cair. Bora vender!",
    cta: "Entendi, vou captar!",
  },
];

export function DashboardTour() {
  return <Tour steps={STEPS} storageKey="meulead_tour_v1" />;
}
