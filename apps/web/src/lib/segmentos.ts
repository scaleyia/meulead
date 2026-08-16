// Segmentos amigáveis → código CNAE (7 dígitos) usado pelo scraper de CNPJ.
// O usuário escolhe "Restaurantes"; a gente manda o CNAE por trás.

export interface Segmento {
  label: string;
  cnae: string;
}

export const SEGMENTOS: Segmento[] = [
  { label: "Restaurantes", cnae: "5611201" },
  { label: "Lanchonetes / Hamburguerias", cnae: "5611203" },
  { label: "Bares", cnae: "5611205" },
  { label: "Padarias e confeitarias", cnae: "4721102" },
  { label: "Academias", cnae: "9313100" },
  { label: "Salões de beleza / Cabeleireiros", cnae: "9602501" },
  { label: "Clínicas odontológicas", cnae: "8630504" },
  { label: "Farmácias", cnae: "4771701" },
  { label: "Óticas", cnae: "4774100" },
  { label: "Pet shops", cnae: "4789004" },
  { label: "Oficinas mecânicas", cnae: "4520001" },
  { label: "Lojas de roupas", cnae: "4781400" },
  { label: "Mercados / Mercearias", cnae: "4712100" },
  { label: "Imobiliárias", cnae: "6821801" },
  { label: "Escritórios de advocacia", cnae: "6911701" },
  { label: "Contabilidade", cnae: "6920601" },
  { label: "Hotéis e pousadas", cnae: "5510801" },
  { label: "Construtoras", cnae: "4120400" },
  { label: "Escolas de idiomas", cnae: "8593700" },
];

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
